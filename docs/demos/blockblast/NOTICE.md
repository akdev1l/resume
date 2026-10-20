# BlockBlast (static build)

The BlockBlast web build (Rust compiled to WebAssembly with Emscripten, rendered
with WebGL2 and Dear ImGui), copied here as-is from the BlockBlast repo's `dist/`
(`scripts/dev.sh build-web`). See `web/README.md` for how to update it.

- Built from the BlockBlast repo at commit `e47ff31` (2026-10-16), build version
  `dad914560d046783` (the hash in the glue script's and wasm's names).
- `sw.js` is a service worker for offline play. It registers for `/demos/blockblast/`
  only, and only in a secure context.
- BlockBlast is licensed GPL-3.0-or-later. The bundled Inter font is under the
  SIL Open Font License 1.1 (`OFL.txt`).
