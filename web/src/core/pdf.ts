// Thin wrapper around pdf.js: open a document, draw a page onto a canvas.
import { getDocument, GlobalWorkerOptions, RenderingCancelledException } from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export type { PDFPageProxy };

GlobalWorkerOptions.workerSrc = workerUrl;

// Output resolution relative to the page's size in points; multiplied by the
// device pixel ratio so the page stays sharp on high-dpi screens.
const RENDER_SCALE = 1.7;

export interface Task<T> {
  promise: Promise<T>;
  cancel(): void;
}

export function openDocument(url: string): Task<PDFPageProxy[]> {
  const loadingTask = getDocument({ url });

  const promise = loadingTask.promise.then((doc) =>
    Promise.all(Array.from({ length: doc.numPages }, (_, i) => doc.getPage(i + 1))),
  );

  return { promise, cancel: () => void loadingTask.destroy() };
}

export function renderPage(page: PDFPageProxy, canvas: HTMLCanvasElement): Task<void> {
  const viewport = page.getViewport({ scale: RENDER_SCALE * window.devicePixelRatio });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderTask = page.render({ canvas, viewport });
  return { promise: renderTask.promise, cancel: () => renderTask.cancel() };
}

export const isCancelled = (error: unknown): boolean =>
  error instanceof RenderingCancelledException;
