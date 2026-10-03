import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmbeddedDemo } from "./EmbeddedDemo";
import { BootSplashDemo } from "./BootSplashDemo";
import { FaceStretchDemo } from "./FaceStretchDemo";

describe("EmbeddedDemo", () => {
  it("runs a static demo build in a titled iframe", () => {
    render(<EmbeddedDemo src="/demos/x/index.html" title="X demo" allow="camera" />);

    const frame = screen.getByTitle("X demo");
    expect(frame.tagName).toBe("IFRAME");
    expect(frame).toHaveAttribute("src", "/demos/x/index.html");
    expect(frame).toHaveAttribute("allow", "camera");
    expect(frame.style.aspectRatio).toBe("16 / 10");
  });

  it("takes the demo's aspect ratio", () => {
    render(<EmbeddedDemo src="/demos/y/index.html" title="Y demo" aspectRatio="4 / 3" />);

    expect(screen.getByTitle("Y demo").style.aspectRatio).toBe("4 / 3");
  });
});

describe("BootSplashDemo", () => {
  it("embeds the 3dboot web viewer at 4:3 without extra permissions", () => {
    render(<BootSplashDemo />);

    const frame = screen.getByTitle("3D boot splash renderer demo");
    expect(frame).toHaveAttribute("src", "/demos/3dboot/index.html");
    expect(frame).not.toHaveAttribute("allow");
    expect(frame.style.aspectRatio).toBe("4 / 3");
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
