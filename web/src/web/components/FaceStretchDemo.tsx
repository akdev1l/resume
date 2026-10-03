import { EmbeddedDemo } from "./EmbeddedDemo";

// webmface64: a stretchy 3D head that can mirror the visitor's face through the
// camera. The static build lives in public/demos/webmface64/ (see README).
export function FaceStretchDemo() {
  return (
    <EmbeddedDemo
      src="/demos/webmface64/index.html"
      title="Stretchy face demo"
      // the demo asks for the camera only when its camera button is pressed
      allow="camera; autoplay; fullscreen"
    />
  );
}
