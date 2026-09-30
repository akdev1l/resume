// The resume's sections, in page order. The side navigation and the resume
// page are both built from this list, so they cannot drift apart.
export const SECTIONS = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "education", title: "Education" },
  { id: "projects", title: "Personal Projects" },
  { id: "demos", title: "Demos" },
  { id: "open-source", title: "Open Source Contributions" },
  { id: "skills", title: "Skills" },
  { id: "languages", title: "Languages" },
  { id: "contact", title: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
