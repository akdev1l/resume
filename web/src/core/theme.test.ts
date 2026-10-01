import { describe, expect, it, vi } from "vitest";

import { savedTheme, setTheme, THEME_STORAGE_KEY } from "./theme";

describe("theme", () => {
  it("defaults to the system theme", () => {
    expect(savedTheme()).toBe("system");
  });

  it("applies and remembers light and dark", () => {
    setTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(savedTheme()).toBe("dark");
  });

  it("forgets the choice when going back to the system theme", () => {
    setTheme("light");
    setTheme("system");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it("ignores junk in storage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "purple");
    expect(savedTheme()).toBe("system");
  });

  it("still switches when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    setTheme("dark");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(savedTheme()).toBe("system");
  });
});
