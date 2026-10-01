import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Flag } from "./Flag";

describe("Flag", () => {
  it.each(["es", "gb", "ES", "GB"])("draws a decorative flag for %s", (code) => {
    const { container } = render(<Flag code={code} />);
    const flag = container.querySelector(".flag");
    expect(flag).toHaveAttribute("aria-hidden", "true");
    expect(flag?.querySelector("svg")).toBeInTheDocument();
  });

  it.each([undefined, "", "fr"])("draws nothing for %s", (code) => {
    const { container } = render(<Flag code={code} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("gives every UK flag its own clip path ids", () => {
    const { container } = render(
      <>
        <Flag code="gb" />
        <Flag code="gb" />
      </>,
    );
    const ids = [...container.querySelectorAll("clipPath")].map((clip) => clip.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });
});
