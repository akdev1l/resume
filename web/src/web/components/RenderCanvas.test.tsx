import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RenderCanvas } from "./RenderCanvas";

function fakeContext() {
  return { scale: vi.fn(), fillRect: vi.fn(), fillText: vi.fn() } as unknown as CanvasRenderingContext2D & {
    fillRect: ReturnType<typeof vi.fn>;
    fillText: ReturnType<typeof vi.fn>;
  };
}

describe("RenderCanvas", () => {
  it("is an image named after its label", () => {
    render(<RenderCanvas columns={16} rows={20} label="Render output" />);
    expect(screen.getByRole("img", { name: "Render output" })).toBeInstanceOf(HTMLCanvasElement);
  });

  it("draws the background, one square per playfield cell, and the label", () => {
    const ctx = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx);

    render(<RenderCanvas columns={16} rows={20} fieldColumns={10} label="Render output" />);

    // background + 10x20 empty squares
    expect(ctx.fillRect).toHaveBeenCalledTimes(1 + 10 * 20);
    expect(ctx.fillText).toHaveBeenCalledWith("Render output", expect.any(Number), expect.any(Number));
  });
});
