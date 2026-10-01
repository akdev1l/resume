import { PDF_URL } from "../../core/route";

export function Footer({ name }: { name: string }) {
  return (
    <footer className="container layout-footer">
      <small>
        © {new Date().getFullYear()} {name} ·{" "}
        <a href="https://github.com/akdev1l/resume">Source on GitHub</a> ·{" "}
        <a href={PDF_URL} download>
          Download PDF
        </a>
      </small>
    </footer>
  );
}
