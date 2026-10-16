# BlastBall (static build)

The BlastBall game's Web export (Godot 4.7, WebAssembly, single-threaded), copied
here as-is from the BlastBall repo's `build/web/`. See `web/README.md` for how to
update it.

- Built from the BlastBall repo at commit `0d9b80a` (2026-10-14).
- Almost all of the 40 MB is the Godot engine (`index.wasm`); the game itself is
  `index.pck` (1.2 MB).
- `index.wasm` ships gzipped as `index.wasm.gz` (10 MB), since Cloudflare Pages takes
  files up to 25 MiB. `wasm-gzip.js` is not part of the export: loaded before
  `index.js`, it answers Godot's fetch of `index.wasm` with the inflated `.gz`.
- Godot's Web build needs a secure context (HTTPS or localhost).
