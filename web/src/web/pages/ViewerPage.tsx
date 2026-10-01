import { PdfDocument } from "../components/PdfDocument";
import { PageTitle } from "../layout/PageTitle";

export function ViewerPage({ url }: { url: string }) {
  return (
    <>
      <PageTitle title="Resume (PDF)" />
      <p>
        <a href={url} download>
          Download {url}
        </a>
      </p>
      <PdfDocument url={url} />
    </>
  );
}
