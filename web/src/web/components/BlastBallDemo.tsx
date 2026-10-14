import { EmbeddedDemo } from "./EmbeddedDemo";

// BlastBall: the Godot 4 game's Web export (WebAssembly). The static build lives
// in public/demos/blastball/ (see README).
export function BlastBallDemo() {
  return <EmbeddedDemo src="/demos/blastball/index.html" title="BlastBall game" aspectRatio="16 / 9" />;
}
