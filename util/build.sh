#!/bin/bash

set -x

main() {
    xelatex --output-directory=${OUT_DIR} main.tex
}

main "$@"
