import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Carousel } from "./Carousel";

// jsdom has no layout: fake the strip's size and scroll position, and a
// ResizeObserver that reports the first layout like browsers do.
let layout = { scrollWidth: 0, clientWidth: 0, scrollLeft: 0 };
const scrollBy = vi.fn();

beforeEach(() => {
  layout = { scrollWidth: 0, clientWidth: 0, scrollLeft: 0 };
  for (const key of ["scrollWidth", "clientWidth", "scrollLeft"] as const) {
    Object.defineProperty(HTMLElement.prototype, key, { configurable: true, get: () => layout[key] });
  }
  HTMLElement.prototype.scrollBy = scrollBy as typeof HTMLElement.prototype.scrollBy;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private readonly callback: () => void) {}
      observe() {
        this.callback();
      }
      disconnect() {}
    },
  );
});

afterEach(() => {
  for (const key of ["scrollWidth", "clientWidth", "scrollLeft"]) {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key];
  }
  vi.unstubAllGlobals();
  scrollBy.mockReset();
});

const items = ["One", "Two", "Three"].map((name) => ({ key: name, content: <p>{name}</p> }));

describe("Carousel", () => {
  it("lists its items in a labelled, focusable strip", () => {
    render(<Carousel label="Demos" items={items} />);

    const carousel = screen.getByRole("region", { name: "Demos" });
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    const list = within(carousel).getByRole("list");
    expect(list).toHaveAttribute("tabindex", "0");
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["One", "Two", "Three"]);
  });

  it("has no buttons when everything fits", () => {
    layout = { scrollWidth: 600, clientWidth: 600, scrollLeft: 0 };
    render(<Carousel label="Demos" items={items} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pages forward and back a strip-width at a time when it overflows", async () => {
    layout = { scrollWidth: 1500, clientWidth: 600, scrollLeft: 0 };
    render(<Carousel label="Demos" items={items} />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 600, behavior: "smooth" });

    layout.scrollLeft = 300;
    fireEvent.scroll(screen.getByRole("list"));
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -600, behavior: "smooth" });
  });

  it("disables Next once scrolled to the end", () => {
    layout = { scrollWidth: 1500, clientWidth: 600, scrollLeft: 0 };
    render(<Carousel label="Demos" items={items} />);

    layout.scrollLeft = 900;
    fireEvent.scroll(screen.getByRole("list"));
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });
});
