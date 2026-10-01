import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router";

import { loadResume, type Resume } from "../core/resume";
import { PDF_PATH, PDF_URL } from "../core/route";
import { Layout } from "./layout/Layout";
import { DemoPage } from "./pages/DemoPage";
import { NotFoundPage } from "./pages/NotFoundPage";
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

// A new page starts at the top, unless the link points at a section.
function useScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
}

export function App() {
  const state = useResume();
  useScrollToTopOnNavigate();

  switch (state.status) {
    case "loading":
      return <main className="container" aria-busy="true" />;
    case "error":
      return (
        <main className="container">
          <p>
            The resume could not be loaded. The <a href={PDF_URL}>pdf version</a> may
            still work.
          </p>
        </main>
      );
    case "ready":
      return (
        <Layout resume={state.resume}>
          <Routes>
            <Route path="/" element={<ResumePage resume={state.resume} />} />
            <Route
              path={PDF_PATH}
              element={
                <Suspense fallback={<article aria-busy="true" />}>
                  <ViewerPage url={PDF_URL} />
                </Suspense>
              }
            />
            <Route path="/demo/:id" element={<DemoPage demos={state.resume.demos} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      );
  }
}
