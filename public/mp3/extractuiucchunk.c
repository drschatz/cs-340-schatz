#include <stdio.h>
#include "pnglib.h"

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "USAGE: %s existingfilename.png filetosaveto\n", argv[0]);
        return 1;
    }
    // argv[1] is the filename of the input .png file
    // argv[2] is the filename of the output .png file
    

    return 0;
}
