import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TechTiles } from "./TechTiles";

describe("TechTiles", () => {
  it("shows a tile per item with its name and description, linking to its site", () => {
    render(
      <TechTiles
        items={[
          { name: "Python", url: "https://www.python.org", logo: "python", description: "Scripting language." },
          { name: "Qt", url: "https://www.qt.io", logo: "qt" },
        ]}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const python = screen.getByRole("link", { name: /Python/ });
    expect(python).toHaveAttribute("href", "https://www.python.org");
    expect(python).toHaveTextContent("Scripting language.");
  });

  it("draws a Simple Icons logo in its brand colour", () => {
    const { container } = render(<TechTiles items={[{ name: "Python", logo: "python" }]} />);
    const logo = container.querySelector<HTMLElement>(".tech-logo")!;
    expect(logo.querySelector("svg path")).toHaveAttribute("d");
    expect(logo.style.getPropertyValue("--logo-light")).toBe("#3776AB");
  });

  it("shows an image logo for paths", () => {
    const { container } = render(<TechTiles items={[{ name: "Engine", logo: "/logos/engine.webp" }]} />);
    expect(container.querySelector(".tech-logo img")).toHaveAttribute("src", "/logos/engine.webp");
  });

  it("falls back to a monogram without a known logo", () => {
    const { container } = render(
      <TechTiles items={[{ name: "AWS" }, { name: "Analytical Notation", logo: "not-an-icon" }]} />,
    );
    const monograms = [...container.querySelectorAll(".tech-monogram")].map((m) => m.textContent);
    expect(monograms).toEqual(["AWS", "AN"]);
  });

  it("renders a tile without a url as plain content, not a link", () => {
    render(<TechTiles items={[{ name: "Analytical Notation" }]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Analytical Notation")).toBeInTheDocument();
  });
});
