import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

export default function Document({
  selectedDocs,
  filename,
}: {
  selectedDocs: Blob[];
  filename: string;
}) {
  return (
    selectedDocs.length > 0 && (
      <DocViewer
        style={{
          width: window.innerWidth < 1200 ? "100%" : "49%",
          height: window.innerWidth < 1400 ? "65vh" : "70vh",
          overflowY: "hidden",
          borderRadius: "5px",
        }}
        documents={selectedDocs.map((file) => ({
          uri: window.URL.createObjectURL(file),
          fileName: filename,
        }))}
        pluginRenderers={DocViewerRenderers.filter(
          (docRender) => !docRender.fileTypes.includes("doc")
        )}
      />
    )
  );
}
