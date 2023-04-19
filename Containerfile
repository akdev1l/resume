FROM fedora:38

RUN dnf install -y 'dnf-command(builddep)' rpkg python-setuptools

COPY . /tmp/workdir
WORKDIR /tmp/workdir

RUN rpkg spec --spec ./rpm -p > /tmp/out.spec && \
    dnf builddep -y /tmp/out.spec && rm /tmp/out.spec
