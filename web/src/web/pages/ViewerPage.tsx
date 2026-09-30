import { PdfDocument } from "../components/PdfDocument";

export function ViewerPage({ url }: { url: string }) {
  return (
    <>
      <p>
        <a href={url} download>
          Download {url}
        </a>
      </p>
      <PdfDocument url={url} />
    </>
  );
}
