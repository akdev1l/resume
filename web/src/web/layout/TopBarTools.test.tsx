import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopBarTools } from "./TopBarTools";

describe("TopBarTools", () => {
  it("contains the theme switcher", () => {
    const { container } = render(<TopBarTools />);
    expect(container.firstChild).toHaveClass("top-bar-tools");
    expect(screen.getByRole("group", { name: "Colour theme" })).toBeInTheDocument();
  });
});
