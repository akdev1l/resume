#!/bin/bash

BUILD_DIR="${BUILD_DIR:-build}"

main() {

    [[ -f "${BUILD_DIR}/CMakeCache.txt" ]] || \
        cmake -B "${BUILD_DIR}" -DRESUME_BUILD_WEB=OFF

    inotifywait -e close_write -m src --format '%f' | \
    while read filename; do
        cmake --build "${BUILD_DIR}"
    done
}

main "$@"
