import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmbeddedDemo } from "./EmbeddedDemo";
import { FaceStretchDemo } from "./FaceStretchDemo";

describe("EmbeddedDemo", () => {
  it("runs a static demo build in a titled iframe", () => {
    render(<EmbeddedDemo src="/demos/x/index.html" title="X demo" allow="camera" />);

    const frame = screen.getByTitle("X demo");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", "/demos/x/index.html");
    expect(frame).toHaveAttribute("allow", "camera");
  });
});

describe("FaceStretchDemo", () => {
  it("embeds the webmface64 build and lets it use the camera", () => {
    render(<FaceStretchDemo />);

    const frame = screen.getByTitle("Stretchy face demo");
    expect(frame).toHaveAttribute("src", "/demos/webmface64/index.html");
    expect(frame.getAttribute("allow")).toContain("camera");
  });
});
