#include <stdio.h>
#include "pnglib.h"

int main(int argc, char *argv[]) {
    if (argc != 4) {
        fprintf(stderr, "USAGE: %s existingfilename.png filetoinsert result.png\n", argv[0]);
        return 1;
    }
    // argv[1] is the filename of the input .png file
    // argv[2] is the filename of the input data file to copy into the uiuc chunk
    // argv[3] is the filename of the output .png file
    
    return 0;
}
