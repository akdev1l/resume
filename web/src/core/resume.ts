// The resume content, shared with the LaTeX build (src/resume.json in the
// repository) and deployed next to the site as /resume.json.
export const RESUME_URL = "/resume.json";

export interface Link {
  text: string;
  url: string;
}

export interface Named {
  name: string;
  url?: string;
}

// A tech demo. With an `id` it runs on this site at #/demo/<id>; otherwise
// `url` points to wherever it is hosted. `source` links to its code.
export interface Demo extends Named {
  id?: string;
  description: string;
  stack: string[];
  source?: string;
}

// A language, technology, framework or project shown as a tile on the web
// page. `logo` is a Simple Icons name or an image path (see core/logos.ts).
export interface Tech extends Named {
  logo?: string;
  description?: string;
}

export interface Resume {
  meta: { title: string; author: string; subject: string; keywords: string[] };
  name: { first: string; last: string };
  headline: string;
  // picture for the web page's top bar; initials are shown when there is none
  avatar?: string;
  // introduction on the web page, one string per paragraph
  about: string[];
  contact: {
    location: Link;
    github: Link;
    email: string;
    phone: { text: string; number: string };
  };
  programmingLanguages: Tech[];
  // `flag` is a country code shown as a flag on the web page, e.g. "es"
  humanLanguages: { name: string; level: string; flag?: string }[];
  openSource: (Tech & { description: string })[];
  tech: Tech[];
  frameworks: Tech[];
  stats: { label: string; value: number }[];
  experience: { dates: string; title: string; org: Named; highlights: string[] }[];
  education: { date: string; title: string; url?: string; org: Named }[];
  projects: (Named & { date: string; stack: string[]; description: string })[];
  demos: Demo[];
}

export async function loadResume(url: string = RESUME_URL): Promise<Resume> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`fetching ${url} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as Resume;
}

// The GitHub username from the profile link, e.g. "akdev1l".
export const githubUser = (r: Resume): string =>
  new URL(r.contact.github.url).pathname.split("/").filter(Boolean)[0];

export const fullName = (r: Resume): string => `${r.name.first} ${r.name.last}`;

// The headline when there is one, otherwise the current role.
export const description = (r: Resume): string => r.headline || r.experience[0].title;
