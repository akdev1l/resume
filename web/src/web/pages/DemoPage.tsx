import { lazy, Suspense, type ComponentType } from "react";
import { Link, useParams } from "react-router";

import type { Demo } from "../../core/resume";
import { sectionPath } from "../../core/route";
import { RenderCanvas } from "../components/RenderCanvas";
import { PageTitle } from "../layout/PageTitle";

// Demos that run on this page, loaded only when opened. Demos listed in
// resume.json without an entry here show a placeholder canvas.
const DEMOS: Record<string, { component: ComponentType; controls?: string }> = {
  tetris: {
    component: lazy(() => import("../components/TetrisGame").then((m) => ({ default: m.TetrisGame }))),
    controls: "← → move · ↑ or X rotate · Z rotate back · ↓ soft drop · Space hard drop · P pause",
  },
};

export function DemoPage({ demos }: { demos: Demo[] }) {
  const { id = "" } = useParams();
  const demo = demos.find((d) => d.id === id);
  if (!demo) {
    return (
      <article>
        <PageTitle title="Demo not found" />
        <p>
          There is no demo called “{id}”. See the <Link to={sectionPath("demos")}>list of demos</Link>.
        </p>
      </article>
    );
  }

  const runnable = DEMOS[id];

  return (
    <article className="demo-page">
      <PageTitle title={demo.name} />
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
        <Link to={sectionPath("demos")}>← All demos</Link>
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
