import { describe, expect, it } from "vitest";

import { findLogo, isLogoImage, monogram } from "./logos";

describe("logos", () => {
  it("finds Simple Icons logos with their brand colour", () => {
    const python = findLogo("python")!;
    expect(python.title).toBe("Python");
    expect(python.path).toMatch(/^M/);
    expect(python.light).toBe("#3776AB");
    expect(python.dark).toBe("#3776AB");
  });

  it("drops a brand colour that would vanish into the background", () => {
    // black: fine on white, invisible on the dark theme
    expect(findLogo("openjdk")).toMatchObject({ light: "#000000", dark: null });
  });

  it("knows nothing about unlisted or missing names", () => {
    expect(findLogo("spotify")).toBeUndefined();
    expect(findLogo(undefined)).toBeUndefined();
  });

  it("tells image paths from icon names", () => {
    expect(isLogoImage("/logos/universal-blue.webp")).toBe(true);
    expect(isLogoImage("neovim")).toBe(false);
    expect(isLogoImage(undefined)).toBe(false);
  });

  it.each([
    ["AWS", "AWS"],
    ["SFML", "SFML"],
    ["Boost", "B"],
    ["Dear ImGui", "DI"],
    ["one two three", "OT"],
  ])("abbreviates %s as %s", (name, short) => {
    expect(monogram(name)).toBe(short);
  });
});
