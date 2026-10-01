import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NamedLink } from "./NamedLink";

describe("NamedLink", () => {
  it("links the name when there is a url", () => {
    render(<NamedLink item={{ name: "Qt", url: "https://www.qt.io" }} />);
    expect(screen.getByRole("link", { name: "Qt" })).toHaveAttribute("href", "https://www.qt.io");
  });

  it("shows plain text without a url", () => {
    render(<NamedLink item={{ name: "De Morgan" }} />);
    expect(screen.getByText("De Morgan")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
