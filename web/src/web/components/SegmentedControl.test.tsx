import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl";

const segments = [
  { value: "en", label: "English", content: "EN" },
  { value: "es", label: "Español", content: "ES" },
] as const;

describe("SegmentedControl", () => {
  it("shows one labelled button per segment and marks the current one", () => {
    render(<SegmentedControl label="Language" segments={[...segments]} value="es" onChange={() => {}} />);

    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Español" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "English" })).toHaveTextContent("EN");
  });

  it("reports the clicked segment", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Language" segments={[...segments]} value="en" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Español" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("es");
  });
});
