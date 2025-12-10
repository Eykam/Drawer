import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

export default function DocumentViewer({
  selectedDocs,
  filename,
}: {
  selectedDocs: Blob[];
  filename: string;
}) {
  if (selectedDocs.length === 0) {
    return null;
  }

  return (
    <DocViewer
      style={{
        width: "100%",
        height: "100%",
        minHeight: "60vh",
        overflowY: "auto",
        borderRadius: "5px",
      }}
      documents={selectedDocs.map((file) => ({
        uri: window.URL.createObjectURL(file),
        fileName: filename.split("/").pop() || filename,
      }))}
      pluginRenderers={DocViewerRenderers.filter(
        (docRender) => !docRender.fileTypes.includes("doc")
      )}
    />
  );
}
