import { useEffect, type ReactNode } from "react";

import { githubUser, type Named, type Resume } from "../../core/resume";
import { SECTIONS, type SectionId } from "../../core/sections";
import { DemoCard } from "../components/DemoCard";
import { Entry } from "../components/Entry";
import { Flag } from "../components/Flag";
import { GitHubActivity } from "../components/GitHubActivity";
import { NamedLink } from "../components/NamedLink";
import { StatsChart } from "../components/StatsChart";
import "./resume.css";

const InlineList = ({ items }: { items: Named[] }) => (
  <ul className="inline-list">
    {items.map((item) => (
      <li key={item.name}>
        <NamedLink item={item} />
      </li>
    ))}
  </ul>
);

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

  "open-source": (resume) => (
    <ul>
      {resume.openSource.map((p) => (
        <li key={p.name}>
          <NamedLink item={p} />: {p.description}
        </li>
      ))}
    </ul>
  ),

  skills: (resume) => (
    <div className="skills">
      <div>
        <h3>Programming Languages</h3>
        <InlineList items={resume.programmingLanguages} />
        <h3>Tech</h3>
        <InlineList items={resume.tech} />
        <h3>Frameworks</h3>
        <InlineList items={resume.frameworks} />
      </div>
      <StatsChart stats={resume.stats} />
    </div>
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

  contact: (resume) => {
    const { location, github, email, phone } = resume.contact;
    return (
      <dl className="contact">
        <dt>Location</dt>
        <dd>
          <a href={location.url}>{location.text}</a>
        </dd>
        <dt>GitHub</dt>
        <dd>
          <a href={github.url}>{github.text}</a>
        </dd>
        <dt>Mail</dt>
        <dd>
          <a href={`mailto:${email}`}>{email}</a>
        </dd>
        <dt>Phone</dt>
        <dd>
          <a href={`tel:${phone.number}`}>{phone.text}</a>
        </dd>
      </dl>
    );
  },
};

export function ResumePage({ resume }: { resume: Resume }) {
  // coming back from the pdf viewer through a section link: the browser tried
  // to scroll before the section existed, so do it once it does
  useEffect(() => {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, []);

  return SECTIONS.map(({ id, title }) => (
    <section key={id} id={id}>
      <h2>{title}</h2>
      {CONTENT[id](resume)}
    </section>
  ));
}
