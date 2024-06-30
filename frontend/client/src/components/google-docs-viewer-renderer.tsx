import { DocRenderer, IDocument } from "@cyntler/react-doc-viewer";

export const GoogleDocsViewerRenderer: DocRenderer = ({
  mainState: { currentDocument },
}) => {
  if (!currentDocument || !currentDocument.uri) return null;
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
    currentDocument.uri
  )}&embedded=true`;

  return (
    <iframe
      title="DocsRenderer"
      src={viewerUrl}
      style={{ width: "100%", height: "80vh", border: "none" }}
      frameBorder="0"
    ></iframe>
  );
};

GoogleDocsViewerRenderer.fileTypes = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.presentation",
];
GoogleDocsViewerRenderer.weight = 10;
