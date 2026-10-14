// Runs before every test file (see `test.setupFiles` in vite.config.ts).
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// jsdom has no canvas: getContext() would log "not implemented" for every
// canvas. Returning null is what browsers do without a context, and the
// components already handle it. Tests that check drawing stub it themselves.
// jsdom has no layout, so nothing ever resizes: an observer that never fires.
// Tests that need sizes stub it themselves (see Carousel.test.tsx).
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.head.querySelectorAll("title").forEach((title) => title.remove());
});
