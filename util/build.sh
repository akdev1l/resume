#!/bin/bash

main() {

    xelatex --output-directory=${OUT_DIR} main.tex
}

main "$@"