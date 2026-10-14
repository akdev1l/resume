// Configures the Emscripten module before blockblast-web.js runs.
// URL query parameters become command-line arguments: ?seed=42 -> --seed=42.
// A --seed is always passed: from ?seed= if present, otherwise random.
"use strict";

/** A random u64, in decimal. */
function randomSeed() {
  const [high, low] = crypto.getRandomValues(new Uint32Array(2));
  return ((BigInt(high) << 32n) | BigInt(low)).toString();
}

function argumentsFromQuery(search) {
  const params = new URLSearchParams(search);
  const args = [];
  for (const [key, value] of params) {
    if (key !== "seed") {
      args.push(value === "" ? `--${key}` : `--${key}=${value}`);
    }
  }
  args.push(`--seed=${params.has("seed") ? params.get("seed") : randomSeed()}`);
  return args;
}

/**
 * The CSS safe-area insets as "top right bottom left" in CSS pixels, read
 * from the #safe-area probe in index.html. Called by the platform layer
 * after every resize.
 */
function blockblastSafeArea() {
  const style = getComputedStyle(document.getElementById("safe-area"));
  return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
    .map((value) => parseFloat(value) || 0)
    .join(" ");
}

var Module = {
  canvas: document.getElementById("canvas"),
  arguments: argumentsFromQuery(window.location.search),
};
