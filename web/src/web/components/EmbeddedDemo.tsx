import type { CSSProperties } from "react";

import "./embedded-demo.css";

// A demo that ships as its own static build under public/demos/<name>/ and runs in
// an iframe, so its scripts and styles stay isolated from the resume's.
export function EmbeddedDemo({
  src,
  title,
  allow,
  aspectRatio = "16 / 10",
}: {
  src: string;
  title: string;
  allow?: string;
  aspectRatio?: string;
}) {
  // --demo-aspect caps the width too, so the ratio holds once max-height kicks in
  const style = { aspectRatio, "--demo-aspect": aspectRatio } as CSSProperties;
  return <iframe className="embedded-demo" src={src} title={title} allow={allow} style={style} />;
}
