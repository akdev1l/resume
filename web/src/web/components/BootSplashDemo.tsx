import { EmbeddedDemo } from "./EmbeddedDemo";

// plymouth-3dboot's viewer: the Rust CPU rasterizer compiled to WebAssembly with
// Emscripten and SDL3. The static build lives in public/demos/3dboot/ (see README).
export function BootSplashDemo() {
  return <EmbeddedDemo src="/demos/3dboot/index.html" title="3D boot splash renderer demo" aspectRatio="4 / 3" />;
}
