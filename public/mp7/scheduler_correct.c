#include "scheduler_common.h"

#define MAX_RUNNING 64

typedef struct {
    pid_t   pid;
    int     job_idx;   
    double  start;
    double  deadline;
} Running;

static int dispatch(const Config *cfg, Job *job, Running *slot, const char *stdout_path, const char *stderr_path) {
    int out_fd = open(stdout_path, O_WRONLY|O_CREAT|O_TRUNC, 0644);
    int err_fd = open(stderr_path, O_WRONLY|O_CREAT|O_TRUNC, 0644);
    if (out_fd < 0 || err_fd < 0) { close(out_fd); close(err_fd); return -1; }

    pid_t pid = fork();
    if (pid == 0) {
        dup2(out_fd, STDOUT_FILENO);
        dup2(err_fd, STDERR_FILENO);
        close(out_fd); close(err_fd);
        if (cfg->use_shell) { execl("/bin/sh","sh","-c",job->cmd,NULL); }
        else {
            char buf[MAX_CMD]; strncpy(buf, job->cmd, MAX_CMD-1);
            char *argv[MAX_ARGS]; int argc=0;
            char *tok = strtok(buf," \t");
            while(tok && argc<MAX_ARGS-1){argv[argc++]=tok;tok=strtok(NULL," \t");}
            argv[argc]=NULL; execvp(argv[0],argv);
        }
        _exit(127);
    }
    close(out_fd); close(err_fd);
    slot->pid = pid;
    slot->start = now_s();
    slot->deadline = slot->start + job->timeout_s;
    return 0;
}

int main(int argc, char **argv) {
    Config cfg;
    const char *jobs_file = parse_args(argc, argv, &cfg);
    safe_mkdir(cfg.out_dir);

    static Job jobs[MAX_JOBS];
    int n_jobs = parse_jobs(jobs_file, cfg.default_timeout_s, jobs, MAX_JOBS);
    static Result results[MAX_JOBS];
    memset(results, 0, sizeof(results));
    int n_results = 0;

    int pending[MAX_JOBS], n_pending = 0;
    for (int i = 0; i < n_jobs; i++) pending[n_pending++] = i;

    Running running[MAX_RUNNING];
    int running_cpu_used[MAX_RUNNING]; 
    int n_running = 0;
    int total_running_cpu = 0;

    int new_pending[MAX_JOBS], nn = 0;
    for (int i = 0; i < n_pending; i++) {
        Job *j = &jobs[pending[i]];
        if (j->cpu > cfg.cpu_capacity) {
            Result *r = &results[n_results++];
            r->job_id = j->job_id; strncpy(r->cmd, j->cmd, MAX_CMD-1);
            r->cpu = j->cpu; strncpy(r->status, STATUS_UNSCHED, 31);
            r->returncode = -9999; r->wall_time_s = 0.0;
            snprintf(r->error, 255, "job requires %d CPU but capacity is %d", j->cpu, cfg.cpu_capacity);
        } else {
            new_pending[nn++] = pending[i];
        }
    }
    n_pending = nn;
    memcpy(pending, new_pending, nn * sizeof(int));

    while (n_pending > 0 || n_running > 0) {
        int dispatched = 1;
        while (dispatched && n_running < cfg.workers) {
            dispatched = 0;
            for (int i = 0; i < n_pending; i++) {
                Job *j = &jobs[pending[i]];
                if (n_running >= cfg.workers) break;
                if (total_running_cpu + j->cpu > cfg.cpu_capacity) continue;
                int slot = n_running;
                char sp[MAX_PATH], ep[MAX_PATH];
                build_paths(&cfg, j, sp, ep);
                if (dispatch(&cfg, j, &running[slot], sp, ep) == 0) {
                    running[slot].job_idx = pending[i];
                    running_cpu_used[slot] = j->cpu;
                    total_running_cpu += j->cpu;
                    n_running++;
                    dispatched = 1;
                    memmove(&pending[i], &pending[i+1], (n_pending-i-1)*sizeof(int));
                    n_pending--;
                }
                break;
            }
        }

        if (n_running == 0) break;

        struct timespec ts = {0, 10000000};
        nanosleep(&ts, NULL);

        double t = now_s();
        for (int i = 0; i < n_running; ) {
            if (t >= running[i].deadline) {
                kill(running[i].pid, SIGKILL);
                waitpid(running[i].pid, NULL, 0);
                Job *j = &jobs[running[i].job_idx];
                Result *r = &results[n_results++];
                r->job_id = j->job_id; strncpy(r->cmd, j->cmd, MAX_CMD-1);
                r->cpu = j->cpu; strncpy(r->status, STATUS_TIMEOUT, 31);
                r->returncode = -9999; r->wall_time_s = t - running[i].start;
                snprintf(r->error, 255, "timed out after %.2fs", j->timeout_s);
                build_paths(&cfg, j, r->stdout_path, r->stderr_path);
                total_running_cpu -= running_cpu_used[i];
                running[i] = running[--n_running];
                running_cpu_used[i] = running_cpu_used[n_running];
                continue;
            }
            int status; pid_t w = waitpid(running[i].pid, &status, WNOHANG);
            if (w == running[i].pid) {
                Job *j = &jobs[running[i].job_idx];
                Result *r = &results[n_results++];
                r->job_id = j->job_id; strncpy(r->cmd, j->cmd, MAX_CMD-1);
                r->cpu = j->cpu; r->wall_time_s = t - running[i].start;
                build_paths(&cfg, j, r->stdout_path, r->stderr_path);
                if (WIFEXITED(status)) {
                    r->returncode = WEXITSTATUS(status);
                    strncpy(r->status, r->returncode==0 ? STATUS_SUCCESS : STATUS_FAIL, 31);
                } else {
                    r->returncode = -9999;
                    strncpy(r->status, STATUS_FAIL, 31);
                    snprintf(r->error, 255, "killed by signal %d", WTERMSIG(status));
                }
                total_running_cpu -= running_cpu_used[i];
                running[i] = running[--n_running];
                running_cpu_used[i] = running_cpu_used[n_running];
                continue;
            }
            i++;
        }
    }

    qsort(results, n_results, sizeof(Result), cmp_result_by_id);
    write_summary(&cfg, results, n_results);

    int any_bad = 0;
    for (int i = 0; i < n_results; i++)
        if (strcmp(results[i].status,STATUS_FAIL)==0||strcmp(results[i].status,STATUS_TIMEOUT)==0)
            any_bad=1;
    return any_bad ? 1 : 0;
}
