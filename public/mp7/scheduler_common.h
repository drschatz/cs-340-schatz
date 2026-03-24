/*
 * scheduler_common.h
 * Shared types, parsing, and utilities for all scheduler implementations.
 */

#ifndef SCHEDULER_COMMON_H
#define SCHEDULER_COMMON_H

#define _POSIX_C_SOURCE 200809L

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <fcntl.h>
#include <time.h>
#include <errno.h>
#include <signal.h>
#include <pthread.h>
#include <stdarg.h>
#include <ctype.h>

/* -------------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------------- */

#define MAX_JOBS        1024
#define MAX_CMD         4096
#define MAX_PATH        1024
#define MAX_ARGS        256
#define STATUS_SUCCESS  "SUCCESS"
#define STATUS_FAIL     "FAIL"
#define STATUS_TIMEOUT  "TIMEOUT"
#define STATUS_UNSCHED  "UNSCHEDULABLE"

/* -------------------------------------------------------------------------
 * Job and Result types
 * ---------------------------------------------------------------------- */

typedef struct {
    int    job_id;
    char   cmd[MAX_CMD];
    int    cpu;
    double timeout_s;
} Job;

typedef struct {
    int    job_id;
    char   cmd[MAX_CMD];
    int    cpu;
    char   status[32];
    int    returncode;      /* -9999 = null (TIMEOUT/UNSCHEDULABLE) */
    double wall_time_s;
    char   stdout_path[MAX_PATH];
    char   stderr_path[MAX_PATH];
    char   error[256];
} Result;

/* -------------------------------------------------------------------------
 * Global configuration (set by main, read by workers)
 * ---------------------------------------------------------------------- */

typedef struct {
    int    workers;
    int    cpu_capacity;
    double default_timeout_s;
    char   out_dir[MAX_PATH];
    char   summary_path[MAX_PATH];
    int    use_shell;
} Config;

/* -------------------------------------------------------------------------
 * Utility: current wall time in seconds
 * ---------------------------------------------------------------------- */
static inline double now_s(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec * 1e-9;
}

/* -------------------------------------------------------------------------
 * Utility: mkdir -p
 * ---------------------------------------------------------------------- */
static void safe_mkdir(const char *path) {
    char tmp[MAX_PATH];
    snprintf(tmp, sizeof(tmp), "%s", path);
    for (char *p = tmp + 1; *p; p++) {
        if (*p == '/') {
            *p = '\0';
            mkdir(tmp, 0755);
            *p = '/';
        }
    }
    mkdir(tmp, 0755);
}

/* -------------------------------------------------------------------------
 * Utility: sanitize a string for use in a filename (first 50 chars)
 * ---------------------------------------------------------------------- */
static void sanitize_filename(const char *src, char *dst, size_t dstsz) {
    size_t j = 0;
    for (size_t i = 0; src[i] && i < 50 && j + 1 < dstsz; i++) {
        char c = src[i];
        if (isalnum((unsigned char)c) || c == '-' || c == '_' || c == '.') {
            dst[j++] = c;
        } else if (isspace((unsigned char)c)) {
            dst[j++] = '_';
        }
    }
    /* strip trailing underscores */
    while (j > 0 && dst[j-1] == '_') j--;
    dst[j] = '\0';
    if (j == 0) { dst[0] = 'j'; dst[1] = 'o'; dst[2] = 'b'; dst[3] = '\0'; }
}

/* -------------------------------------------------------------------------
 * Utility: build stdout/stderr paths for a job
 * ---------------------------------------------------------------------- */
static void build_paths(const Config *cfg, const Job *job,
                         char *out_stdout, char *out_stderr) {
    char san[64];
    sanitize_filename(job->cmd, san, sizeof(san));
    snprintf(out_stdout, MAX_PATH, "%s/%04d_cpu%d_%s.stdout.txt",
             cfg->out_dir, job->job_id, job->cpu, san);
    snprintf(out_stderr, MAX_PATH, "%s/%04d_cpu%d_%s.stderr.txt",
             cfg->out_dir, job->job_id, job->cpu, san);
}

/* -------------------------------------------------------------------------
 * Utility: JSON escape a string (basic — handles quotes and backslashes)
 * ---------------------------------------------------------------------- */
static void json_escape(const char *src, char *dst, size_t dstsz) {
    size_t j = 0;
    for (size_t i = 0; src[i] && j + 2 < dstsz; i++) {
        if (src[i] == '"' || src[i] == '\\') dst[j++] = '\\';
        dst[j++] = src[i];
    }
    dst[j] = '\0';
}

/* -------------------------------------------------------------------------
 * Write summary.json
 * ---------------------------------------------------------------------- */
static void write_summary(const Config *cfg, Result *results, int n) {
    /* ensure parent dir exists */
    char tmp[MAX_PATH];
    snprintf(tmp, sizeof(tmp), "%s", cfg->summary_path);
    char *slash = strrchr(tmp, '/');
    if (slash) { *slash = '\0'; safe_mkdir(tmp); }

    FILE *f = fopen(cfg->summary_path, "w");
    if (!f) { perror("fopen summary"); return; }

    fprintf(f, "[\n");
    for (int i = 0; i < n; i++) {
        Result *r = &results[i];
        char cmd_e[MAX_CMD*2], err_e[512], out_e[MAX_PATH*2], err2_e[MAX_PATH*2];
        json_escape(r->cmd,         cmd_e,  sizeof(cmd_e));
        json_escape(r->error,       err_e,  sizeof(err_e));
        json_escape(r->stdout_path, out_e,  sizeof(out_e));
        json_escape(r->stderr_path, err2_e, sizeof(err2_e));

        fprintf(f, "  {\n");
        fprintf(f, "    \"job_id\": %d,\n",       r->job_id);
        fprintf(f, "    \"cmd\": \"%s\",\n",       cmd_e);
        fprintf(f, "    \"cpu\": %d,\n",           r->cpu);
        fprintf(f, "    \"status\": \"%s\",\n",    r->status);
        if (r->returncode == -9999)
            fprintf(f, "    \"returncode\": null,\n");
        else
            fprintf(f, "    \"returncode\": %d,\n", r->returncode);
        fprintf(f, "    \"wall_time_s\": %.4f,\n", r->wall_time_s);
        fprintf(f, "    \"stdout_path\": \"%s\",\n", out_e);
        fprintf(f, "    \"stderr_path\": \"%s\",\n", err2_e);
        fprintf(f, "    \"error\": \"%s\"\n",      err_e);
        fprintf(f, "  }%s\n", (i < n-1) ? "," : "");
    }
    fprintf(f, "]\n");
    fclose(f);
}

/* -------------------------------------------------------------------------
 * Run one job as a child process with timeout.
 * Fills in result->status, returncode, wall_time_s, paths, error.
 * ---------------------------------------------------------------------- */
static void run_job(const Config *cfg, const Job *job, Result *result) {
    result->job_id = job->job_id;
    strncpy(result->cmd,  job->cmd,  MAX_CMD-1);
    result->cpu = job->cpu;
    result->error[0] = '\0';

    build_paths(cfg, job, result->stdout_path, result->stderr_path);

    int out_fd = open(result->stdout_path, O_WRONLY|O_CREAT|O_TRUNC, 0644);
    int err_fd = open(result->stderr_path, O_WRONLY|O_CREAT|O_TRUNC, 0644);
    if (out_fd < 0 || err_fd < 0) {
        snprintf(result->error, sizeof(result->error), "failed to open output files");
        strncpy(result->status, STATUS_FAIL, sizeof(result->status)-1);
        result->returncode = -9999;
        result->wall_time_s = 0.0;
        if (out_fd >= 0) close(out_fd);
        if (err_fd >= 0) close(err_fd);
        return;
    }

    double start = now_s();
    pid_t pid = fork();

    if (pid == 0) {
        /* child */
        dup2(out_fd, STDOUT_FILENO);
        dup2(err_fd, STDERR_FILENO);
        close(out_fd); close(err_fd);

        if (cfg->use_shell) {
            execl("/bin/sh", "sh", "-c", job->cmd, NULL);
        } else {
            /* simple tokenization for non-shell mode */
            char buf[MAX_CMD];
            strncpy(buf, job->cmd, MAX_CMD-1);
            char *argv[MAX_ARGS];
            int argc = 0;
            char *tok = strtok(buf, " \t");
            while (tok && argc < MAX_ARGS-1) {
                argv[argc++] = tok;
                tok = strtok(NULL, " \t");
            }
            argv[argc] = NULL;
            execvp(argv[0], argv);
        }
        _exit(127);
    }

    close(out_fd); close(err_fd);

    if (pid < 0) {
        snprintf(result->error, sizeof(result->error), "fork failed: %s", strerror(errno));
        strncpy(result->status, STATUS_FAIL, sizeof(result->status)-1);
        result->returncode = -9999;
        result->wall_time_s = now_s() - start;
        return;
    }

    /* wait with timeout */
    double deadline = start + job->timeout_s;
    int timed_out = 0;
    int status = 0;

    while (1) {
        pid_t w = waitpid(pid, &status, WNOHANG);
        if (w == pid) break;
        if (w < 0) break;
        if (now_s() >= deadline) {
            kill(pid, SIGKILL);
            waitpid(pid, &status, 0);
            timed_out = 1;
            break;
        }
        struct timespec ts = {0, 10000000}; /* 10ms */
        nanosleep(&ts, NULL);
    }

    result->wall_time_s = now_s() - start;

    if (timed_out) {
        strncpy(result->status, STATUS_TIMEOUT, sizeof(result->status)-1);
        result->returncode = -9999;
        snprintf(result->error, sizeof(result->error),
                 "timed out after %.2fs", job->timeout_s);
    } else if (WIFEXITED(status)) {
        int code = WEXITSTATUS(status);
        result->returncode = code;
        strncpy(result->status, code == 0 ? STATUS_SUCCESS : STATUS_FAIL,
                sizeof(result->status)-1);
    } else {
        result->returncode = -9999;
        strncpy(result->status, STATUS_FAIL, sizeof(result->status)-1);
        snprintf(result->error, sizeof(result->error), "killed by signal %d",
                 WTERMSIG(status));
    }
}

/* -------------------------------------------------------------------------
 * Parse jobs file. Returns number of jobs read.
 * ---------------------------------------------------------------------- */
static int parse_jobs(const char *path, double default_timeout, Job *jobs, int max_jobs) {
    FILE *f = fopen(path, "r");
    if (!f) { perror("fopen jobs"); return 0; }

    char line[MAX_CMD];
    int n = 0;

    while (fgets(line, sizeof(line), f) && n < max_jobs) {
        /* strip trailing newline/whitespace */
        size_t len = strlen(line);
        while (len > 0 && isspace((unsigned char)line[len-1])) line[--len] = '\0';

        /* skip blank and comment lines */
        char *p = line;
        while (isspace((unsigned char)*p)) p++;
        if (*p == '\0' || *p == '#') continue;

        Job *job = &jobs[n];
        job->cpu      = 1;
        job->timeout_s = default_timeout;

        /* parse prefixes */
        while (1) {
            if (strncmp(p, "cpu=", 4) == 0) {
                job->cpu = atoi(p + 4);
                while (*p && !isspace((unsigned char)*p)) p++;
                while (isspace((unsigned char)*p)) p++;
            } else if (strncmp(p, "timeout=", 8) == 0) {
                job->timeout_s = atof(p + 8);
                while (*p && !isspace((unsigned char)*p)) p++;
                while (isspace((unsigned char)*p)) p++;
            } else {
                break;
            }
        }

        /* remaining text is the command */
        if (*p == '\0') continue;  /* no command after prefixes */
        strncpy(job->cmd, p, MAX_CMD-1);
        job->job_id = n;
        n++;
    }

    fclose(f);
    return n;
}

/* -------------------------------------------------------------------------
 * Parse command-line arguments into Config.
 * Returns the jobs_file path (argv[1]).
 * ---------------------------------------------------------------------- */
static const char* parse_args(int argc, char **argv, Config *cfg) {
    /* defaults */
    cfg->workers          = 4;
    cfg->cpu_capacity     = 4;
    cfg->default_timeout_s = 5.0;
    cfg->use_shell        = 0;
    strncpy(cfg->out_dir,      "out",          MAX_PATH-1);
    strncpy(cfg->summary_path, "summary.json", MAX_PATH-1);

    if (argc < 2) {
        fprintf(stderr, "Usage: %s <jobs_file> [options]\n", argv[0]);
        exit(1);
    }

    for (int i = 2; i < argc; i++) {
        if (strcmp(argv[i], "--workers") == 0 && i+1 < argc)
            cfg->workers = atoi(argv[++i]);
        else if (strcmp(argv[i], "--cpu-capacity") == 0 && i+1 < argc)
            cfg->cpu_capacity = atoi(argv[++i]);
        else if (strcmp(argv[i], "--timeout") == 0 && i+1 < argc)
            cfg->default_timeout_s = atof(argv[++i]);
        else if (strcmp(argv[i], "--out") == 0 && i+1 < argc)
            strncpy(cfg->out_dir, argv[++i], MAX_PATH-1);
        else if (strcmp(argv[i], "--summary") == 0 && i+1 < argc)
            strncpy(cfg->summary_path, argv[++i], MAX_PATH-1);
        else if (strcmp(argv[i], "--shell") == 0)
            cfg->use_shell = 1;
    }

    return argv[1];
}

/* -------------------------------------------------------------------------
 * Compare Results by job_id for qsort
 * ---------------------------------------------------------------------- */
static int cmp_result_by_id(const void *a, const void *b) {
    return ((Result*)a)->job_id - ((Result*)b)->job_id;
}

#endif /* SCHEDULER_COMMON_H */
