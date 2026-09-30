#!/bin/bash

set -x

main() {
    node ../util/gen-tex.mjs resume.json ${OUT_DIR}/resume-data.tex
    TEXINPUTS="${OUT_DIR}:" xelatex --output-directory=${OUT_DIR} main.tex
    TEXINPUTS="${OUT_DIR}:" xelatex --output-directory=${OUT_DIR} main.tex
}

main "$@"
