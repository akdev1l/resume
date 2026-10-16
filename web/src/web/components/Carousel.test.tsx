import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Carousel } from "./Carousel";

const items = ["One", "Two", "Three"].map((name) => ({ key: name, content: <p>{name}</p> }));

describe("Carousel", () => {
  it("shows its items as slides in a labelled, focusable strip", () => {
    render(<Carousel label="Demos" items={items} />);

    const carousel = screen.getByRole("region", { name: "Demos" });
    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    expect(carousel.firstElementChild).toHaveAttribute("tabindex", "0");
    const slides = within(carousel).getAllByRole("group");
    expect(slides.map((slide) => slide.textContent)).toEqual(["One", "Two", "Three"]);
    expect(slides.map((slide) => slide.getAttribute("aria-label"))).toEqual(["1 of 3", "2 of 3", "3 of 3"]);
    expect(slides[0]).toHaveAttribute("aria-roledescription", "slide");
  });

  it("has no previous/next buttons", () => {
    render(<Carousel label="Demos" items={items} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
