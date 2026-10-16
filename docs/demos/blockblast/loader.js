// Configures the Emscripten module before blockblast-web.js runs.
// URL query parameters become command-line arguments: ?seed=42 -> --seed=42.
// A --seed is always passed: from ?seed= if present, otherwise random.
// Without ?seed=, --persist is passed too: the best score and the game in
// progress are kept in localStorage. A ?seed= session is a deterministic test
// session and neither reads nor writes storage (docs/SPEC.md §2.9).
//
// The browser APIs the game itself calls (storage, vibration, safe area) are
// in crates/blockblast-web/src/platform/bridge.js, linked into the bundle.
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
    // Only the loader decides about persistence.
    if (key !== "seed" && key !== "persist") {
      args.push(value === "" ? `--${key}` : `--${key}=${value}`);
    }
  }
  if (params.has("seed")) {
    args.push(`--seed=${params.get("seed")}`);
  } else {
    args.push(`--seed=${randomSeed()}`, "--persist");
  }
  return args;
}

// The canvas handles touches itself (its handlers prevent scrolling and
// zooming); these block what is left. The long-press context menu and
// iOS Safari's pinch zoom (gesture events, which ignore user-scalable=no)
// on the whole page, and double-click text selection or zoom.
for (const type of ["contextmenu", "gesturestart", "gesturechange", "dblclick"]) {
  document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
}

// Offline play (sw.js). Service workers need a secure context (HTTPS or
// localhost), so over plain HTTP on a LAN the game simply runs online.
if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.warn("blockblast: no offline support:", error);
    });
  });
}

var Module = {
  canvas: document.getElementById("canvas"),
  arguments: argumentsFromQuery(window.location.search),
  // The build names the glue script and the wasm after its version (the
  // blockblast-build meta tag in index.html, which also names the script),
  // so a glue script is never paired with another build's wasm.
  locateFile: (path) => {
    const build = document.querySelector('meta[name="blockblast-build"]').content;
    return path === "blockblast_web.wasm" ? `blockblast_web.${build}.wasm` : path;
  },
};
