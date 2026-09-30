#!/usr/bin/env node
//
// gen-tex.mjs - turn resume.json into a file of LaTeX macros for main.tex
//
// usage: node gen-tex.mjs <resume.json> [output.tex]   (stdout by default)
//
// Every block of the resume becomes one \resume... macro; main.tex decides
// where each one goes. The output only uses commands from friggeri-cv.cls
// and main.tex, so it has to be \input after those are defined.
//
import { readFileSync, writeFileSync } from "node:fs";
import { argv, exit, stderr, stdout } from "node:process";

// Characters LaTeX treats specially in running text. `~` is written as the
// same $\sim$ the hand-written main.tex used, not as a non-breaking space.
const TEXT_ESCAPES = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  $: "\\$",
  "%": "\\%",
  "&": "\\&",
  "#": "\\#",
  _: "\\_",
  "^": "\\textasciicircum{}",
  "~": "$\\sim$",
  "\n": " ",
};

const tex = (text) => String(text).replace(/[\\{}$%&#_^~\n]/g, (c) => TEXT_ESCAPES[c]);

// \href takes its url verbatim at the top level, but inside a macro body
// # and % still have to be escaped.
const url = (href) => String(href).replace(/[%#]/g, (c) => `\\${c}`);

const href = (target, label) => `\\href{${url(target)}}{${label}}`;

// A {name, url} object as a link, or plain text when there is no url.
const named = ({ name, url: target }) => (target ? href(target, tex(name)) : tex(name));

const newcommand = (name, body) => `\\newcommand{\\${name}}{${body}}`;

const block = (name, lines) => `\\newcommand{\\${name}}{%\n${lines.join("\n")}%\n}`;

// The aside environment runs under \obeycr, which turns every line end into
// a line break. A macro defined with ordinary catcodes would collapse its
// lines into spaces, so the aside lists are defined with ^^M active: the
// stored line ends then act exactly like the ones typed inside the aside.
// Blank lines are not allowed in here; an active ^^M outside a macro body
// would run at the top level.
const obeycrBlocks = (blocks) =>
  [
    "\\begingroup",
    "\\catcode`\\^^M=\\active%",
    ...Object.entries(blocks).map(
      ([name, lines]) => `\\gdef\\${name}{%\n${lines.join("\n")}%\n}%`,
    ),
    "\\endgroup",
  ].join("\n");

const asideItem = (content) => `\\item[\\rightarrow] ${content}`;

const entry = (date, title, org, body) =>
  `  \\entry\n    {${date}}\n    {${title}}\n    {${org}}\n    {${body}}`;

const shortentry = (date, title, org) =>
  `  \\shortentry\n    {${date}}\n    {${title}}\n    {${org}}`;

const itemize = (items) =>
  [
    "\\begin{itemize}",
    ...items.map((item) => `        \\item ${tex(item)}`),
    "    \\end{itemize}",
  ].join("\n");

// Pentagon (or any polygon) corners, starting at the top and going
// counter-clockwise like the TikZ axes in \skillchart.
const statsShape = (stats) => {
  const step = 360 / stats.length;
  const corners = stats.map(
    ({ value }, i) => `(${(90 + i * step) % 360}:${value})`,
  );
  return [...corners, "cycle"].join(" -- ");
};

// Bold the local part, like {\boldfont hire@}alexdiaz.fyi
const email = (address) => {
  const at = address.indexOf("@");
  const local = tex(address.slice(0, at + 1));
  const domain = tex(address.slice(at + 1));
  return href(`mailto:${address}`, `{\\boldfont ${local}}${domain}`);
};

function generate(resume) {
  const { meta, name, contact } = resume;

  return [
    "% Generated from resume.json by util/gen-tex.mjs - do not edit.",
    "",
    "% document metadata",
    newcommand("resumeMetaTitle", tex(meta.title)),
    newcommand("resumeMetaAuthor", tex(meta.author)),
    newcommand("resumeMetaSubject", tex(meta.subject)),
    newcommand("resumeMetaKeywords", meta.keywords.map(tex).join(",")),
    "",
    "% header",
    newcommand("resumeFirstName", tex(name.first)),
    newcommand("resumeLastName", tex(name.last)),
    newcommand("resumeHeadline", tex(resume.headline)),
    "",
    "% contact details",
    newcommand("resumeLocation", href(contact.location.url, tex(contact.location.text))),
    newcommand("resumeGithub", href(contact.github.url, tex(contact.github.text))),
    newcommand("resumeEmail", email(contact.email)),
    newcommand(
      "resumePhone",
      href(`tel:${contact.phone.number}`, tex(contact.phone.text)),
    ),
    "",
    "% aside lists, one \\item per line (see obeycrBlocks)",
    obeycrBlocks({
      resumeProgrammingLanguages: resume.programmingLanguages.map((l) => asideItem(named(l))),
      resumeHumanLanguages: resume.humanLanguages.map((l) =>
        asideItem(`${tex(l.name)} (${tex(l.level)})`),
      ),
      resumeOpenSource: resume.openSource.map((p) =>
        asideItem(`${named(p)}: ${tex(p.description)}`),
      ),
      resumeTech: resume.tech.map((t) => asideItem(named(t))),
      resumeFrameworks: resume.frameworks.map((f) => asideItem(named(f))),
    }),
    "",
    "% skill chart: axis labels, axis count and the filled polygon",
    newcommand("resumeStatsLabels", resume.stats.map((s) => tex(s.label)).join(", ")),
    newcommand("resumeStatsCount", String(resume.stats.length)),
    newcommand("resumeStatsShape", statsShape(resume.stats)),
    "",
    "% entrylist contents",
    block(
      "resumeExperience",
      resume.experience.map((job) =>
        entry(tex(job.dates), tex(job.title), named(job.org), itemize(job.highlights)),
      ),
    ),
    "",
    block(
      "resumeEducation",
      resume.education.map((e) =>
        shortentry(tex(e.date), named({ name: e.title, url: e.url }), named(e.org)),
      ),
    ),
    "",
    block(
      "resumeProjects",
      resume.projects.map((p) =>
        entry(tex(p.date), named(p), p.stack.map(tex).join(", "), tex(p.description)),
      ),
    ),
    "",
  ].join("\n");
}

function main([input, output]) {
  if (!input) {
    stderr.write("usage: gen-tex.mjs <resume.json> [output.tex]\n");
    exit(2);
  }

  const result = generate(JSON.parse(readFileSync(input, "utf8")));

  if (output) {
    writeFileSync(output, result);
  } else {
    stdout.write(result);
  }
}

main(argv.slice(2));
