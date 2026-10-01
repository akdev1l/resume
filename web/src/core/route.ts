// Paths of the site's pages. Section anchors like #experience belong to the
// resume at "/", so links to them work from every page.
export const PDF_URL = "/main.pdf";
export const PDF_PATH = "/pdf";

export const demoPath = (id: string): string => `/demo/${encodeURIComponent(id)}`;

export const sectionPath = (id: string): string => `/#${id}`;

// Before path routing the pages lived in the hash (#/pdf, #/main.pdf,
// #/demo/<id>); links shared back then map to their path here.
export function legacyHashPath(hash: string): string | null {
  if (hash === "#/pdf" || hash === "#/main.pdf") {
    return PDF_PATH;
  }
  if (hash.startsWith("#/demo/")) {
    return `/demo/${hash.slice("#/demo/".length)}`;
  }
  return null;
}
