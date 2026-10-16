# Development environment for the web app (web/): Node 24 and pnpm on
# Fedora 44. Build it and work in it with:
#
#   podman build -f Containerfile.builder -t localhost/resume-builder .
#   podman run --rm -it -v "$PWD:/resume:z" -w /resume/web localhost/resume-builder \
#       sh -c 'pnpm install && pnpm lint && pnpm test && pnpm build'
#
# Mount the checkout at /resume: web/node_modules records its pnpm store
# there (.pnpm-store/ in the checkout).
FROM registry.fedoraproject.org/fedora:44

RUN dnf install -y --setopt=install_weak_deps=False \
        nodejs24 \
        nodejs24-npm \
        pnpm \
        git \
    && dnf clean all

WORKDIR /resume/web
