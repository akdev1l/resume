import "./embedded-demo.css";

// A demo that ships as its own static build under public/demos/<name>/ and runs in
// an iframe, so its scripts and styles stay isolated from the resume's.
export function EmbeddedDemo({ src, title, allow }: { src: string; title: string; allow?: string }) {
  return <iframe className="embedded-demo" src={src} title={title} allow={allow} />;
}
