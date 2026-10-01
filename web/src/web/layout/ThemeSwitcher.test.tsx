import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeSwitcher } from "./ThemeSwitcher";

const pressed = () =>
  screen.getAllByRole("button").find((button) => button.getAttribute("aria-pressed") === "true");

describe("ThemeSwitcher", () => {
  it("follows the system theme by default", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("group", { name: "Colour theme" })).toBeInTheDocument();
    expect(pressed()).toHaveAccessibleName("System theme");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("pins and remembers a theme, and System clears it", async () => {
    render(<ThemeSwitcher />);

    await userEvent.click(screen.getByRole("button", { name: "Dark theme" }));
    expect(pressed()).toHaveAccessibleName("Dark theme");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    await userEvent.click(screen.getByRole("button", { name: "System theme" }));
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("starts from the remembered theme", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeSwitcher />);
    expect(pressed()).toHaveAccessibleName("Light theme");
  });
});
