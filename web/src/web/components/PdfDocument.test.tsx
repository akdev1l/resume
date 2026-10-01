import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { openDocument, type PDFPageProxy } from "../../core/pdf";
import { PdfDocument } from "./PdfDocument";

vi.mock("../../core/pdf", () => ({
  openDocument: vi.fn(),
  renderPage: () => ({ promise: Promise.resolve(), cancel: () => {} }),
  isCancelled: () => false,
}));

const pages = [{ pageNumber: 1 }, { pageNumber: 2 }] as PDFPageProxy[];

describe("PdfDocument", () => {
  beforeEach(() => {
    vi.mocked(openDocument).mockReset();
  });

  it("shows a loading state, then one canvas per page", async () => {
    vi.mocked(openDocument).mockReturnValue({ promise: Promise.resolve(pages), cancel: () => {} });

    render(<PdfDocument url="/main.pdf" />);
    expect(screen.getByText(/Loading \/main\.pdf/)).toHaveAttribute("aria-busy", "true");

    expect(await screen.findByRole("img", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Page 2" })).toBeInTheDocument();
    expect(openDocument).toHaveBeenCalledWith("/main.pdf");
  });

  it("offers the file itself when it can't be displayed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(openDocument).mockImplementation(() => ({ promise: Promise.reject(new Error("bad pdf")), cancel: () => {} }));

    render(<PdfDocument url="/main.pdf" />);

    expect(await screen.findByText(/Couldn't display \/main\.pdf/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open the pdf directly" })).toHaveAttribute("href", "/main.pdf");
  });

  it("goes back to loading for a new url and cancels the old load", async () => {
    const cancel = vi.fn();
    vi.mocked(openDocument)
      .mockReturnValueOnce({ promise: Promise.resolve(pages), cancel })
      .mockReturnValueOnce({ promise: new Promise(() => {}), cancel: () => {} });

    const { rerender } = render(<PdfDocument url="/a.pdf" />);
    await screen.findByRole("img", { name: "Page 1" });

    rerender(<PdfDocument url="/b.pdf" />);
    expect(screen.getByText(/Loading \/b\.pdf/)).toBeInTheDocument();
    expect(cancel).toHaveBeenCalled();
  });
});
