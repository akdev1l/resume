#!/bin/bash

set -x

main() {

    mkdir -p "${OUT_DIR}"
    xelatex --output-directory=${OUT_DIR} main.tex
}

main "$@"
