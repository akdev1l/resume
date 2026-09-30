import { lazy, Suspense, useEffect, useRef, type ComponentType } from "react";

import type { Demo } from "../../core/resume";
import { RenderCanvas } from "../components/RenderCanvas";

// Demos that run on this page, loaded only when opened. Demos listed in
// resume.json without an entry here show a placeholder canvas.
const DEMOS: Record<string, { component: ComponentType; controls?: string }> = {
  tetris: {
    component: lazy(() => import("../components/TetrisGame").then((m) => ({ default: m.TetrisGame }))),
    controls: "← → move · ↑ or X rotate · Z rotate back · ↓ soft drop · Space hard drop · P pause",
  },
};

export function DemoPage({ id, demo }: { id: string; demo?: Demo }) {
  const article = useRef<HTMLElement>(null);

  // the demo button sits far down the resume; start the demo at its top
  useEffect(() => {
    article.current?.scrollIntoView();
  }, [id]);

  if (!demo) {
    return (
      <article ref={article}>
        <p>
          There is no demo called “{id}”. See the <a href="#demos">list of demos</a>.
        </p>
      </article>
    );
  }

  const runnable = DEMOS[id];

  return (
    <article ref={article} className="demo-page">
      <header>
        <hgroup>
          <h2>{demo.name}</h2>
          <p>{demo.stack.join(", ")}</p>
        </hgroup>
      </header>
      <p>{demo.description}</p>
      {runnable ? (
        <>
          <Suspense fallback={<p aria-busy="true">Loading the demo…</p>}>
            <runnable.component />
          </Suspense>
          {runnable.controls && (
            <p className="demo-status">
              <small>{runnable.controls}</small>
            </p>
          )}
        </>
      ) : (
        <>
          <RenderCanvas columns={16} rows={9} label="Render output" />
          <p className="demo-status">
            <small>This demo isn't wired in yet; it will render in this canvas.</small>
          </p>
        </>
      )}
      <footer>
        <a href="#demos">← All demos</a>
        {demo.source && (
          <>
            {" · "}
            <a href={demo.source}>Source</a>
          </>
        )}
      </footer>
    </article>
  );
}
