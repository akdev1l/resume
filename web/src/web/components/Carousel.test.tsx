import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Carousel } from "./Carousel";

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

  it("has no previous/next buttons", () => {
    render(<Carousel label="Demos" items={items} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
