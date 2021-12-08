export OUT_DIR := $(PWD)/docs

all: $(OUT_DIR)/main.pdf
clean:
	rm -rv $(OUT_DIR)/*
$(OUT_DIR)/main.pdf: src/main.tex src/friggeri-cv.cls
	cd src/ && ../util/build.sh
