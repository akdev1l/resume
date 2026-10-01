import { createContext, useContext } from "react";

// The owner's name, set once by the Layout so pages only name themselves.
export const SiteNameContext = createContext("");

// Sets the document title to "<name> - <title>". React 19 moves a <title>
// rendered anywhere into <head>; render one PageTitle per page.
export function PageTitle({ title }: { title: string }) {
  const name = useContext(SiteNameContext);
  return <title>{name ? `${name} - ${title}` : title}</title>;
}
