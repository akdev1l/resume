export OUT_DIR := $(PWD)/docs
export BUILD_DIR := $(PWD)/build
export INSTALL_DIR := $(PWD)/build/release/

all: $(BUILD_DIR) resume-pdf resume-launcher

resume-launcher: $(BUILD_DIR) $(BUILD_DIR)/akdev-resume
resume-pdf: $(OUT_DIR)/main.pdf

$(BUILD_DIR):
	install -d $(BUILD_DIR)

$(OUT_DIR)/main.pdf: $(BUILD_DIR)/main.pdf
	cp $(BUILD_DIR)/main.pdf $(OUT_DIR)/main.pdf

$(BUILD_DIR)/main.pdf: src/main.tex src/friggeri-cv.cls
	cd src/ && \
	xelatex --output-directory=${BUILD_DIR} -no-pdf main.tex && \
	xelatex --output-directory=${BUILD_DIR} main.tex


$(BUILD_DIR)/akdev-resume: src/bin/akdev-resume.sh
	install -m=755 src/bin/akdev-resume.sh $(BUILD_DIR)/akdev-resume

install: install-resume install-bin install-doc

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
	touch $@

clean:
	rm -rv $(BUILD_DIR)
