FROM fedora:38

RUN dnf install -y \
    'dnf-command(config-manager)' \
    'dnf-command(builddep)' \
    rpkg \
    python-setuptools && \
    dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo && \
    dnf install gh -y

COPY . /tmp/workdir
WORKDIR /tmp/workdir

RUN rpkg spec --spec ./rpm -p > /tmp/out.spec && \
    dnf builddep -y /tmp/out.spec && rm /tmp/out.spec
