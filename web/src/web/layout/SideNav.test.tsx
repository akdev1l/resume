import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SECTIONS } from "../../core/sections";
import { renderAt } from "../../test/fixtures";
import { SideNav } from "./SideNav";

const tab = () => screen.getByRole("button", { name: /sections/ });

// Opens the drawer the way a keyboard user does.
async function openWithKeyboard() {
  tab().focus();
  await userEvent.keyboard("{Enter}");
  expect(tab()).toHaveAttribute("aria-expanded", "true");
}

describe("SideNav", () => {
  it("starts closed, with its links out of reach", () => {
    renderAt(<SideNav />);
    expect(tab()).toHaveAttribute("aria-expanded", "false");
    expect(tab()).toHaveAccessibleName("Show sections");
    expect(document.getElementById("side-nav-panel")).toHaveAttribute("inert");
  });

  it("opens from the pull tab and links every section and the pdf", async () => {
    renderAt(<SideNav />);
    await openWithKeyboard();

    expect(tab()).toHaveAttribute("aria-expanded", "true");
    expect(tab()).toHaveAccessibleName("Hide sections");
    for (const { id, title } of SECTIONS) {
      expect(screen.getByRole("link", { name: title })).toHaveAttribute("href", `/#${id}`);
    }
    expect(screen.getByRole("link", { name: "PDF version" })).toHaveAttribute("href", "/pdf");
  });

  it("closes on Escape, on a press outside, and after picking a section", async () => {
    renderAt(<SideNav />);
    const open = openWithKeyboard;

    await open();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(tab()).toHaveAttribute("aria-expanded", "false");

    await open();
    fireEvent.pointerDown(document.body);
    expect(tab()).toHaveAttribute("aria-expanded", "false");

    await open();
    await userEvent.click(screen.getByRole("link", { name: "Skills" }));
    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens on mouse hover and closes when the mouse leaves", () => {
    renderAt(<SideNav />);
    const drawer = screen.getByRole("navigation", { name: "Resume sections" }).parentElement!;

    fireEvent.pointerEnter(drawer, { pointerType: "mouse" });
    expect(tab()).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerLeave(drawer, { pointerType: "mouse" });
    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });

  it("stays open when a mouse clicks the tab it hovered open", () => {
    renderAt(<SideNav />);
    const drawer = screen.getByRole("navigation", { name: "Resume sections" }).parentElement!;

    // what a browser sends: hover, then press and click (userEvent.click in
    // jsdom skips the pointerdown and leaves the click's pointerType empty)
    fireEvent.pointerEnter(drawer, { pointerType: "mouse" });
    fireEvent.pointerDown(tab(), { pointerType: "mouse" });
    fireEvent.click(tab());
    expect(tab()).toHaveAttribute("aria-expanded", "true");
  });

  it("toggles from the keyboard", async () => {
    renderAt(<SideNav />);
    tab().focus();
    await userEvent.keyboard("{Enter}");
    expect(tab()).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Enter}");
    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles from touch, which doesn't hover", async () => {
    renderAt(<SideNav />);
    const touch = userEvent.setup();
    await touch.pointer({ keys: "[TouchA]", target: tab() });
    expect(tab()).toHaveAttribute("aria-expanded", "true");
    await touch.pointer({ keys: "[TouchA]", target: tab() });
    expect(tab()).toHaveAttribute("aria-expanded", "false");
  });
});
