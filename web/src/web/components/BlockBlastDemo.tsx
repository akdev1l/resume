import { EmbeddedDemo } from "./EmbeddedDemo";

// BlockBlast: the Rust puzzle game compiled to WebAssembly with Emscripten. The
// static build lives in public/demos/blockblast/ (see README).
export function BlockBlastDemo() {
  return (
    <EmbeddedDemo
      src="/demos/blockblast/index.html"
      title="BlockBlast game"
      aspectRatio="3 / 4"
      // the game has a full-screen button
      allow="fullscreen"
    />
  );
}
