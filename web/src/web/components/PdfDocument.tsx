import { useEffect, useState } from "react";

import { openDocument, type PDFPageProxy } from "../../core/pdf";
import { PdfPage } from "./PdfPage";
import "./pdf.css";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; pages: PDFPageProxy[] };

interface PdfDocumentProps {
  url: string;
}

export function PdfDocument({ url }: PdfDocumentProps) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    setState({ status: "loading" });

    let cancelled = false;
    const task = openDocument(url);
    task.promise.then(
      (pages) => !cancelled && setState({ status: "ready", pages }),
      (error: unknown) => {
        if (!cancelled) {
          console.error(`loading ${url} failed`, error);
          setState({ status: "error" });
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
