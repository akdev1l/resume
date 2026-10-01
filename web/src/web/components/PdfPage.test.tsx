import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderPage, type PDFPageProxy } from "../../core/pdf";
import { PdfPage } from "./PdfPage";

vi.mock("../../core/pdf", () => ({
  renderPage: vi.fn(),
  isCancelled: (error: unknown) => error instanceof Error && error.message === "cancelled",
}));

const page = { pageNumber: 2 } as PDFPageProxy;

describe("PdfPage", () => {
  beforeEach(() => {
    vi.mocked(renderPage).mockReset();
  });

  it("renders the page into its canvas and cancels on unmount", () => {
    const cancel = vi.fn();
    vi.mocked(renderPage).mockReturnValue({ promise: Promise.resolve(), cancel });

    const { unmount } = render(<PdfPage page={page} />);
    const canvas = screen.getByRole("img", { name: "Page 2" });

    expect(renderPage).toHaveBeenCalledWith(page, canvas);
    unmount();
    expect(cancel).toHaveBeenCalled();
  });

  it("reports render failures, but not cancellations", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    // rejected only once rendering starts, when the component is listening
    vi.mocked(renderPage)
      .mockImplementationOnce(() => ({ promise: Promise.reject(new Error("broken")), cancel: () => {} }))
      .mockImplementationOnce(() => ({ promise: Promise.reject(new Error("cancelled")), cancel: () => {} }));

    render(<PdfPage page={page} />);
    await waitFor(() => expect(error).toHaveBeenCalledWith("rendering page 2 failed", expect.any(Error)));

    error.mockClear();
    render(<PdfPage page={{ pageNumber: 3 } as PDFPageProxy} />);
    await new Promise((resolve) => setTimeout(resolve));
    expect(error).not.toHaveBeenCalled();
  });
});
