export OUT_DIR := $(PWD)/docs
export BUILD_DIR := $(PWD)/build
export INSTALL_DIR := $(BUILD_DIR)/release

all: $(BUILD_DIR) resume-pdf resume-launcher

.PHONY: clean
clean:
	rm -rv $(BUILD_DIR)

# Abstract Targets
resume-launcher: $(BUILD_DIR)/akdev-resume
resume-pdf: $(OUT_DIR)/main.pdf
resume-web: $(OUT_DIR)/index.html
install: install-resume install-bin install-doc
rpm: $(BUILD_DIR)/rpm/noarch

# Build resume-web npm application
$(OUT_DIR)/index.html: $(BUILD_DIR)/web
	cp -rpv $(BUILD_DIR)/web/dist/* $(OUT_DIR)

# Copy the source to the build directory - I don't want to have an in-tree build, thanks
$(BUILD_DIR)/web: $(BUILD_DIR) web
	cp -rpv web $(BUILD_DIR)
	cd $(BUILD_DIR)/web && \
	podman run --rm -it -v $(BUILD_DIR)/web:/workdir -w /workdir node:17 npm ci && \
	podman run --rm -it -v $(BUILD_DIR)/web:/workdir -w /workdir node:17 npm run build

# Build RPM - we call back to make here this is just for convenience
$(BUILD_DIR)/rpm/noarch:
	+rpkg local --spec rpm/akdev-resume.spec.rpkg --outdir ${BUILD_DIR}/rpm
	
$(BUILD_DIR):
	install -d $(BUILD_DIR)/rpm

# Build PDF
$(OUT_DIR)/main.pdf: $(BUILD_DIR)/main.pdf
	cp $(BUILD_DIR)/main.pdf $(OUT_DIR)/main.pdf

$(BUILD_DIR)/main.pdf: src/main.tex src/friggeri-cv.cls
	cd src/ && \
	xelatex --output-directory=${BUILD_DIR} -no-pdf main.tex && \
	xelatex --output-directory=${BUILD_DIR} main.tex


# Build wrapper launcher
$(BUILD_DIR)/akdev-resume: src/bin/akdev-resume.sh
	install -m=755 src/bin/akdev-resume.sh $(BUILD_DIR)/akdev-resume


# Install targets

install-resume: $(INSTALL_DIR)/usr/share/akdev

$(INSTALL_DIR)/usr/share/akdev:
	install -m=0755 -d $@

install-bin: $(INSTALL_DIR)/usr/bin/akdev-resume

$(INSTALL_DIR)/usr/bin/akdev-resume:
	install -m=0755 -d $(INSTALL_DIR)/usr/bin
	install -m=0755 $(BUILD_DIR)/akdev-resume $(INSTALL_DIR)/usr/bin/akdev-resume

install-doc: $(INSTALL_DIR)/usr/share/man/man1/akdev-resume.gz

$(INSTALL_DIR)/usr/share/man/man1/akdev-resume.gz:
	install -m=0755 -d $(INSTALL_DIR)/usr/share/man/man1
	gzip <<<'hello' > $@

