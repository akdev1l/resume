import { Link } from "react-router";

import type { Demo } from "../../core/resume";
import { demoPath } from "../../core/route";
import { TechLogo } from "./TechLogo";

// One tech demo: what it is, what it's built with, and where to try it.
export function DemoCard({ demo }: { demo: Demo }) {
  return (
    <article className="demo-card">
      <header>
        <TechLogo name={demo.name} logo={demo.logo} />
        <div>
          <h3>{demo.name}</h3>
          <small>{demo.stack.join(", ")}</small>
        </div>
      </header>
      <p>{demo.description}</p>
      {(demo.id || demo.url || demo.source) && (
        <footer>
          {demo.id ? (
            <Link to={demoPath(demo.id)} role="button">
              Try the demo
            </Link>
          ) : (
            demo.url && (
              <a href={demo.url} role="button">
                Try the demo
              </a>
            )
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
