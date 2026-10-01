import { useEffect, useRef } from "react";

import { isCancelled, renderPage, type PDFPageProxy } from "../../core/pdf";

interface PdfPageProps {
  page: PDFPageProxy;
}

export function PdfPage({ page }: PdfPageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const task = renderPage(page, canvas.current!);
    task.promise.catch((error: unknown) => {
      if (!isCancelled(error)) {
        console.error(`rendering page ${page.pageNumber} failed`, error);
      }
    });
    return task.cancel;
  }, [page]);

  return (
    <article className="pdf-page">
      <canvas ref={canvas} role="img" aria-label={`Page ${page.pageNumber}`} />
    </article>
  );
}
