FROM fedora:44

RUN dnf config-manager addrepo \
        --from-repofile=https://cli.github.com/packages/rpm/gh-cli.repo \
    && \
    dnf install -y  \
        rpkg \
        python-setuptools \
        gh \
        nodejs24 \
        nodejs24-npm \
        pnpm

COPY . /tmp/workdir
WORKDIR /tmp/workdir

RUN rpkg spec --spec ./rpm -p > /tmp/out.spec && \
    dnf builddep -y /tmp/out.spec && rm /tmp/out.spec
