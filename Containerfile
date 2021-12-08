FROM fedora:latest

RUN dnf install -y /usr/bin/xelatex texlive-parskip make lilypond-texgyre-heros-fonts texlive-textpos texlive-biblatex texlive-progressbar texlive-firstaid
