import type { ReactNode } from "react";

import "./entry.css";

interface EntryProps {
  date: string;
  title: ReactNode;
  // organisation, or the tech stack for projects
  subtitle: ReactNode;
  children?: ReactNode;
}

// One job, certificate or project: the web version of \entry.
export function Entry({ date, title, subtitle, children }: EntryProps) {
  return (
    <article className="entry">
      <header>
        <hgroup>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </hgroup>
        <small>{date}</small>
      </header>
      {children}
    </article>
  );
}
