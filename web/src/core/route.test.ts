import { describe, expect, it } from "vitest";

import { demoPath, legacyHashPath, PDF_PATH, sectionPath } from "./route";

describe("route", () => {
  it("builds paths for demos and sections", () => {
    expect(demoPath("tetris")).toBe("/demo/tetris");
    expect(demoPath("a b")).toBe("/demo/a%20b");
    expect(sectionPath("skills")).toBe("/#skills");
  });

  it.each([
    ["#/pdf", PDF_PATH],
    ["#/main.pdf", PDF_PATH],
    ["#/demo/tetris", "/demo/tetris"],
    ["#experience", null],
    ["", null],
  ])("maps the old hash link %j to %j", (hash, path) => {
    expect(legacyHashPath(hash)).toBe(path);
  });
});
