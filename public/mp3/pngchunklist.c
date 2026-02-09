#include <stdio.h>
#include "pnglib.h"

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "USAGE: %s existingfilename.png\n", argv[0]);
        return 1;
    }
    // argv[1] is the filename of the input .png file

    
    
    return 0;
}
