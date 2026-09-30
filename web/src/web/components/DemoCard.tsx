import type { Demo } from "../../core/resume";
import { demoHref } from "../../core/route";

// One tech demo: what it is, what it's built with, and where to try it.
export function DemoCard({ demo }: { demo: Demo }) {
  const href = demo.id ? demoHref(demo.id) : demo.url;

  return (
    <article className="demo-card">
      <header>
        <h3>{demo.name}</h3>
        <small>{demo.stack.join(", ")}</small>
      </header>
      <p>{demo.description}</p>
      {(href || demo.source) && (
        <footer>
          {href && (
            <a href={href} role="button">
              Try the demo
            </a>
          )}
          {demo.source && (
            <a href={demo.source} role="button" className="secondary outline">
              Source
            </a>
          )}
        </footer>
      )}
    </article>
  );
}
