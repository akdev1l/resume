import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Entry } from "./Entry";

describe("Entry", () => {
  it("shows the title, subtitle, date and body", () => {
    render(
      <Entry date="1842 - 1843" title="Translator" subtitle="Scientific Memoirs">
        <p>Wrote the notes.</p>
      </Entry>,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Translator" })).toBeInTheDocument();
    expect(screen.getByText("Scientific Memoirs")).toBeInTheDocument();
    expect(screen.getByText("1842 - 1843")).toBeInTheDocument();
    expect(screen.getByText("Wrote the notes.")).toBeInTheDocument();
  });

  it("works without a body", () => {
    const { container } = render(<Entry date="1833" title="Tutoring" subtitle="De Morgan" />);
    expect(container.querySelector("article > header")).toBeInTheDocument();
    expect(container.querySelector("article")?.children).toHaveLength(1);
  });
});
