FROM fedora:35

RUN dnf install -y \
    /usr/bin/xelatex \
    texlive-parskip \
    make \
    lilypond-texgyre-heros-fonts \
    texlive-textpos \
    texlive-biblatex \
    texlive-progressbar \
    texlive-firstaid \
    lato-fonts \
    texlive-lato \
    texlive-tex-gyre
