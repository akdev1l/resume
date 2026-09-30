// The hash picks the page: `#/demo/<id>` opens a tech demo, `#/some.pdf` the
// pdf viewer, and anything else (including section anchors like
// `#experience`) is the resume itself.
export const DEFAULT_PDF_URL = "/main.pdf";

export type Route = { page: "resume" } | { page: "pdf"; url: string } | { page: "demo"; id: string };

const DEMO_PREFIX = "#/demo/";

export const demoHref = (id: string): string => `${DEMO_PREFIX}${encodeURIComponent(id)}`;

export function routeFromHash(hash: string, origin: string): Route {
  if (hash.startsWith(DEMO_PREFIX)) {
    return { page: "demo", id: decodeURIComponent(hash.slice(DEMO_PREFIX.length)) };
  }
  if (!hash.startsWith("#/")) {
    return { page: "resume" };
  }
  return { page: "pdf", url: sameOriginPath(hash.slice(1), origin) };
}

// Only same-origin documents are allowed, so a crafted link cannot make the
// viewer load and run an arbitrary pdf from somewhere else.
function sameOriginPath(requested: string, origin: string): string {
  try {
    const url = new URL(requested, origin);
    return url.origin === origin ? url.pathname + url.search : DEFAULT_PDF_URL;
  } catch {
    return DEFAULT_PDF_URL;
  }
}
