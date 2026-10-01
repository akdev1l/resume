import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";

import { githubUser, type Resume } from "../../core/resume";
import { SECTIONS, type SectionId } from "../../core/sections";
import { DemoCard } from "../components/DemoCard";
import { Entry } from "../components/Entry";
import { Flag } from "../components/Flag";
import { GitHubActivity } from "../components/GitHubActivity";
import { NamedLink } from "../components/NamedLink";
import { StatsChart } from "../components/StatsChart";
import { TechTiles } from "../components/TechTiles";
import { PageTitle } from "../layout/PageTitle";
import "./resume.css";

const CONTENT: Record<SectionId, (resume: Resume) => ReactNode> = {
  about: (resume) => (
    <>
      {resume.about.map((paragraph) => (
        <p key={paragraph} className="about">
          {paragraph}
        </p>
      ))}
      <GitHubActivity user={githubUser(resume)} />
    </>
  ),

  experience: (resume) =>
    resume.experience.map((job) => (
      <Entry
        key={job.dates}
        date={job.dates}
        title={job.title}
        subtitle={<NamedLink item={job.org} />}
      >
        <ul>
          {job.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </Entry>
    )),

  education: (resume) =>
    resume.education.map((e) => (
      <Entry
        key={e.title}
        date={e.date}
        title={<NamedLink item={{ name: e.title, url: e.url }} />}
        subtitle={<NamedLink item={e.org} />}
      />
    )),

  projects: (resume) =>
    resume.projects.map((p) => (
      <Entry key={p.name} date={p.date} title={<NamedLink item={p} />} subtitle={p.stack.join(", ")}>
        <p>{p.description}</p>
      </Entry>
    )),

  demos: (resume) => (
    <div className="demo-grid">
      {resume.demos.map((demo) => (
        <DemoCard key={demo.name} demo={demo} />
      ))}
    </div>
  ),

  "open-source": (resume) => <TechTiles items={resume.openSource} />,

  skills: (resume) => (
    <>
      <h3>Programming Languages</h3>
      <TechTiles items={resume.programmingLanguages} />
      <h3>Tech</h3>
      <TechTiles items={resume.tech} />
      <h3>Frameworks</h3>
      <TechTiles items={resume.frameworks} />
      <h3>Stats</h3>
      <StatsChart stats={resume.stats} />
    </>
  ),

  languages: (resume) => (
    <ul className="languages">
      {resume.humanLanguages.map((l) => (
        <li key={l.name}>
          <Flag code={l.flag} /> {l.name} ({l.level})
        </li>
      ))}
    </ul>
  ),

};

export function ResumePage({ resume }: { resume: Resume }) {
  // Router navigation doesn't scroll to anchors by itself, and on a fresh
  // load the sections only exist once resume.json has arrived; `key` makes a
  // second click on the same section link scroll again too.
  const { hash, key } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    }
  }, [hash, key]);

  return (
    <>
      <PageTitle title="Resume" />
      {SECTIONS.map(({ id, title }) => (
        <section key={id} id={id}>
          <h2>{title}</h2>
          {CONTENT[id](resume)}
        </section>
      ))}
    </>
  );
}
