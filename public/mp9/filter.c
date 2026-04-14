#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image.h"
#include "stb_image_write.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Clamp helper
unsigned char clamp(int val) {
    if (val < 0) return 0;
    if (val > 255) return 255;
    return (unsigned char)val;
}

void apply_hazy(unsigned char* data, int w, int h, int channels) {
    unsigned char* temp = (unsigned char*)malloc(w * h * channels);
    memcpy(temp, data, w * h * channels);

    for (int y = 0; y < h; ++y) {
        // Moderate wave parameters
        float wave = 11.0f * sinf(y / 15.0f);
        for (int x = 0; x < w; ++x) {
            int src_x = (int)(x + wave);
            if (src_x < 0) src_x = 0;
            if (src_x >= w) src_x = w - 1;

            int dst_idx = (y * w + x) * channels;
            int src_idx = (y * w + src_x) * channels;

            // Copy pixel from distorted source
            for (int c = 0; c < channels; ++c) {
                data[dst_idx + c] = temp[src_idx + c];
            }

            // Apply yellow/white tint (boost red and green channels)
            data[dst_idx + 0] = clamp(data[dst_idx + 0] + 20);  // R
            data[dst_idx + 1] = clamp(data[dst_idx + 1] + 20);  // G
            data[dst_idx + 2] = clamp(data[dst_idx + 2] + 60);  // B (small bump for brightness)
        }
    }
    free(temp);
}

void apply_blue_tint(unsigned char* data, int w, int h, int channels) {
    for (int y = 0; y < h; ++y) {
        float factor = 0.5f + 0.5f * ((float)y / h);  // gradient effect
        for (int x = 0; x < w; ++x) {
            int idx = (y * w + x) * channels;
            data[idx + 2] = clamp((int)(data[idx + 2] + 50 * factor));  // Boost blue channel
        }
    }
}

void apply_blur(unsigned char* data, int w, int h, int channels) {
    unsigned char* temp = (unsigned char*)malloc(w * h * channels);
    memcpy(temp, data, w * h * channels);

    for (int y = 1; y < h - 1; ++y) {
        for (int x = 1; x < w - 1; ++x) {
            for (int c = 0; c < channels; ++c) {
                int sum = 0;
                sum += temp[((y - 1) * w + (x - 1)) * channels + c];
                sum += temp[((y - 1) * w + x) * channels + c];
                sum += temp[((y - 1) * w + (x + 1)) * channels + c];
                sum += temp[(y * w + (x - 1)) * channels + c];
                sum += temp[(y * w + x) * channels + c];
                sum += temp[(y * w + (x + 1)) * channels + c];
                sum += temp[((y + 1) * w + (x - 1)) * channels + c];
                sum += temp[((y + 1) * w + x) * channels + c];
                sum += temp[((y + 1) * w + (x + 1)) * channels + c];

                data[(y * w + x) * channels + c] = clamp(sum / 9);
            }
        }
    }
    free(temp);
}

void apply_vibrance(unsigned char* data, int w, int h, int channels) {
    for (int y = 0; y < h; ++y) {
        for (int x = 0; x < w; ++x) {
            int idx = (y * w + x) * channels;
            for (int c = 0; c < 3; ++c) {  // Only RGB
                int v = data[idx + c];
                v = (int)(v * 1.2f + 15);  // Increase contrast and brightness
                data[idx + c] = clamp(v);
            }
        }
    }
}

// Red tint effect
void apply_red_tint(unsigned char* data, int w, int h, int channels) {
    for (int i = 0; i < w * h; ++i) {
        int idx = i * channels;
        if (channels >= 3) {
            int new_r = data[idx] + 50;
            if (new_r > 255) new_r = 255;
            data[idx] = (unsigned char)new_r;
        }
    }
}

// Greenish tint effect
void apply_green_tint(unsigned char* data, int w, int h, int channels) {
    for (int i = 0; i < w * h; ++i) {
        int idx = i * channels;
        if (channels >= 3) {
            int new_g = data[idx + 1] + 50;
            if (new_g > 255) new_g = 255;
            data[idx + 1] = (unsigned char)new_g;
        }
    }
}

// Grayscale effect
void apply_grayscale(unsigned char* data, int w, int h, int channels) {
    for (int i = 0; i < w * h; ++i) {
        int idx = i * channels;
        if (channels >= 3) {
            int avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            data[idx] = data[idx + 1] = data[idx + 2] = (unsigned char)avg;
        }
    }
}

// Invert effect
void apply_invert(unsigned char* data, int w, int h, int channels) {
    for (int i = 0; i < w * h; ++i) {
        int idx = i * channels;
        for (int c = 0; c < 3; ++c) {
            data[idx + c] = 255 - data[idx + c];
        }
    }
}

// Sepia effect
void apply_sepia(unsigned char* data, int w, int h, int channels) {
    for (int i = 0; i < w * h; ++i) {
        int idx = i * channels;
        if (channels >= 3) {
            int r = data[idx];
            int g = data[idx + 1];
            int b = data[idx + 2];

            int tr = (int)(0.393 * r + 0.769 * g + 0.189 * b);
            int tg = (int)(0.349 * r + 0.686 * g + 0.168 * b);
            int tb = (int)(0.272 * r + 0.534 * g + 0.131 * b);

            if (tr > 255) tr = 255;
            if (tg > 255) tg = 255;
            if (tb > 255) tb = 255;

            data[idx] = (unsigned char)tr;
            data[idx + 1] = (unsigned char)tg;
            data[idx + 2] = (unsigned char)tb;
        }
    }
}

int main(int argc, char** argv) {
    if (argc < 4) {
        printf("Usage: %s input.png output.png effect\n", argv[0]);
        printf("Effects: hazy, blue tint, blur, vibrance, red tint, green tint, grayscale, invert, sepia\n");
        return 1;
    }

    char* input_path = argv[1];
    char* output_path = argv[2];
    char* effect = argv[3];

    int w, h, channels;
    unsigned char* data = stbi_load(input_path, &w, &h, &channels, 0);
    if (!data) {
        printf("Failed to load image %s\n", input_path);
        return 1;
    }

    if (strcmp(effect, "hazy") == 0) {
        apply_hazy(data, w, h, channels);
    } else if (strcmp(effect, "blue tint") == 0) {
        apply_blue_tint(data, w, h, channels);
    } else if (strcmp(effect, "blur") == 0) {
        apply_blur(data, w, h, channels);
    } else if (strcmp(effect, "vibrance") == 0) {
        apply_vibrance(data, w, h, channels);
    } else if (strcmp(effect, "red tint") == 0) {
        apply_red_tint(data, w, h, channels);
    } else if (strcmp(effect, "green tint") == 0) {
        apply_green_tint(data, w, h, channels);
    } else if (strcmp(effect, "grayscale") == 0) {
        apply_grayscale(data, w, h, channels);
    } else if (strcmp(effect, "invert") == 0) {
        apply_invert(data, w, h, channels);
    } else if (strcmp(effect, "sepia") == 0) {
        apply_sepia(data, w, h, channels);
    } else {
        printf("Unknown effect: %s\n", effect);
        stbi_image_free(data);
        return 1;
    }

    if (!stbi_write_png(output_path, w, h, channels, data, w * channels)) {
        printf("Failed to write image %s\n", output_path);
        stbi_image_free(data);
        return 1;
    }

    printf("Successfully wrote: %s with effect: %s\n", output_path, effect);
    stbi_image_free(data);
    return 0;
}
