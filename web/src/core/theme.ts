// Light or dark: "system" follows the device setting (prefers-color-scheme),
// the others pin pico's data-theme on <html>. The choice is remembered in
// localStorage; index.html applies it before the first paint with the same
// key, so a dark page doesn't flash light while the app loads.
export type ThemeChoice = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

const isChoice = (value: unknown): value is ThemeChoice =>
  value === "system" || value === "light" || value === "dark";

// Storage can be missing or throw (private windows, blocked storage); the
// theme then just isn't remembered.
export function savedTheme(): ThemeChoice {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isChoice(value) ? value : "system";
  } catch {
    return "system";
  }
}

export function setTheme(choice: ThemeChoice) {
  if (choice === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", choice);
  }
  try {
    if (choice === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, choice);
    }
  } catch {
    // not remembered, see savedTheme
  }
}
