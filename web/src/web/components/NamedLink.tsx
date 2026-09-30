import type { Named } from "../../core/resume";

// A name from resume.json, linked when it has a url.
export function NamedLink({ item }: { item: Named }) {
  return item.url ? <a href={item.url}>{item.name}</a> : <>{item.name}</>;
}
