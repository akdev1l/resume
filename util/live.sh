#!/bin/bash

main() {

    inotifywait -e close_write -m src --format '%f' | \
    while read filename; do
        make
    done
}

main "$@"
