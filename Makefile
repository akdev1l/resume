export OUT_DIR = $(PWD)/output

all: $(OUT_DIR)/main.pdf
clean:
	rm -rv output/*
$(OUT_DIR)/main.pdf: src/main.tex src/friggeri-cv.cls
	cd src/ && ../util/build.sh
