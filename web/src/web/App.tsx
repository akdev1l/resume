import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";

import { loadResume, type Resume } from "../core/resume";
import { DEFAULT_PDF_URL, routeFromHash, type Route } from "../core/route";
import { Layout } from "./layout/Layout";
import { DemoPage } from "./pages/DemoPage";
import { ResumePage } from "./pages/ResumePage";

// pdf.js is most of the bundle; only fetch it when the viewer is opened
const ViewerPage = lazy(() =>
  import("./pages/ViewerPage").then(({ ViewerPage }) => ({ default: ViewerPage })),
);

type ResumeState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; resume: Resume };

function useResume(): ResumeState {
  const [state, setState] = useState<ResumeState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadResume().then(
      (resume) => !cancelled && setState({ status: "ready", resume }),
      (error: unknown) => {
        if (!cancelled) {
          console.error(error);
          setState({ status: "error" });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

const getHash = () => window.location.hash;

export function App() {
  const state = useResume();
  const route = routeFromHash(useSyncExternalStore(subscribe, getHash), window.location.origin);

  switch (state.status) {
    case "loading":
      return <main className="container" aria-busy="true" />;
    case "error":
      return (
        <main className="container">
          <p>
            The resume could not be loaded. The <a href={DEFAULT_PDF_URL}>pdf version</a> may
            still work.
          </p>
        </main>
      );
    case "ready":
      return (
        <Layout resume={state.resume}>
          <Page route={route} resume={state.resume} />
        </Layout>
      );
  }
}

function Page({ route, resume }: { route: Route; resume: Resume }) {
  switch (route.page) {
    case "pdf":
      return (
        <Suspense fallback={<article aria-busy="true" />}>
          <ViewerPage url={route.url} />
        </Suspense>
      );
    case "demo":
      return <DemoPage id={route.id} demo={resume.demos.find((d) => d.id === route.id)} />;
    case "resume":
      return <ResumePage resume={resume} />;
  }
}
