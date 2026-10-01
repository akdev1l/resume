import { useEffect, useState } from "react";

import { openDocument, type PDFPageProxy } from "../../core/pdf";
import { PdfPage } from "./PdfPage";
import "./pdf.css";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; pages: PDFPageProxy[] };

// a finished load and the url it was for
type Result = Exclude<State, { status: "loading" }> & { url: string };

interface PdfDocumentProps {
  url: string;
}

export function PdfDocument({ url }: PdfDocumentProps) {
  const [result, setResult] = useState<Result | null>(null);
  // a result for another url is stale: the new one is still loading
  const state: State = result?.url === url ? result : { status: "loading" };

  useEffect(() => {
    let cancelled = false;
    const task = openDocument(url);
    task.promise.then(
      (pages) => !cancelled && setResult({ url, status: "ready", pages }),
      (error: unknown) => {
        if (!cancelled) {
          console.error(`loading ${url} failed`, error);
          setResult({ url, status: "error" });
        }
      },
    );

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [url]);

  switch (state.status) {
    case "loading":
      return <article aria-busy="true">Loading {url}…</article>;
    case "error":
      return (
        <article>
          Couldn't display {url}. <a href={url}>Open the pdf directly</a> instead.
        </article>
      );
    case "ready":
      return state.pages.map((page) => <PdfPage key={page.pageNumber} page={page} />);
  }
}
