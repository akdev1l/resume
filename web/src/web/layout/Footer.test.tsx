import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "./Footer";

describe("Footer", () => {
  it("shows the copyright, the source and the pdf download", () => {
    render(<Footer name="Ada Lovelace" />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent(`© ${new Date().getFullYear()} Ada Lovelace`);
    expect(screen.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute("href", "https://github.com/akdev1l/resume");
    const download = screen.getByRole("link", { name: "Download PDF" });
    expect(download).toHaveAttribute("href", "/main.pdf");
    expect(download).toHaveAttribute("download");
  });
});
