import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderAt } from "../../test/fixtures";
import { ViewerPage } from "./ViewerPage";

// pdf.js doesn't run in jsdom; PdfDocument has its own tests
vi.mock("../components/PdfDocument", () => ({
  PdfDocument: ({ url }: { url: string }) => <p>pdf document {url}</p>,
}));

describe("ViewerPage", () => {
  it("shows the pdf with a download link and titles the page", () => {
    renderAt(<ViewerPage url="/main.pdf" />);

    expect(screen.getByText("pdf document /main.pdf")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download /main.pdf" })).toHaveAttribute("download");
    expect(document.title).toBe("Ada Lovelace - Resume (PDF)");
  });
});
