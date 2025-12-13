import { useState, useEffect, useRef } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

type FileCategory = "pdf" | "image" | "text" | "office" | "unknown";

function getFileCategory(filename: string): FileCategory {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  if (["txt", "md", "json", "xml", "csv", "log", "js", "ts", "tsx", "jsx", "css", "html", "py", "sh", "yaml", "yml"].includes(ext)) return "text";
  if (["docx", "xlsx", "pptx"].includes(ext)) return "office";

  return "unknown";
}

function getFileType(filename: string): string | undefined {
  const ext = filename.split(".").pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    pdf: "pdf",
    png: "png",
    jpg: "jpg",
    jpeg: "jpeg",
    gif: "gif",
    webp: "webp",
    txt: "txt",
    csv: "csv",
    docx: "docx",
    xlsx: "xlsx",
    pptx: "pptx",
  };
  return ext ? typeMap[ext] : undefined;
}

export default function DocumentViewer({
  selectedDocs,
  filename,
}: {
  selectedDocs: Blob[];
  filename: string;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const category = getFileCategory(filename);
  const blob = selectedDocs[0];

  // Create stable blob URL
  useEffect(() => {
    if (!blob) return;

    // Revoke old URL
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }

    // For PDFs, ensure correct MIME type
    let finalBlob = blob;
    if (category === "pdf" && blob.type !== "application/pdf") {
      finalBlob = new Blob([blob], { type: "application/pdf" });
    }

    const url = URL.createObjectURL(finalBlob);
    urlRef.current = url;
    setBlobUrl(url);

    // For text files, also read the content
    if (category === "text") {
      blob.text().then(setTextContent).catch(() => setTextContent("Failed to load file"));
    }

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [blob, category]);

  if (!blob || !blobUrl) {
    return null;
  }

  // Native PDF rendering via iframe
  if (category === "pdf") {
    return (
      <iframe
        src={blobUrl}
        className="w-full h-full min-h-[60vh] border-0 rounded"
        title={filename}
      />
    );
  }

  // Native image rendering
  if (category === "image") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={blobUrl}
          alt={filename}
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    );
  }

  // Text file rendering
  if (category === "text") {
    return (
      <pre className="w-full h-full min-h-[60vh] overflow-auto p-4 bg-muted rounded text-sm font-mono whitespace-pre-wrap">
        {textContent ?? "Loading..."}
      </pre>
    );
  }

  // Fall back to DocViewer for Office files and unknown types
  const fileType = getFileType(filename);
  const documents = [{
    uri: blobUrl,
    fileName: filename.split("/").pop() || filename,
    fileType,
  }];

  return (
    <DocViewer
      style={{
        width: "100%",
        height: "100%",
        minHeight: "60vh",
        overflowY: "auto",
        borderRadius: "5px",
      }}
      documents={documents}
      pluginRenderers={DocViewerRenderers.filter(
        (docRender) => !docRender.fileTypes.includes("doc")
      )}
      config={{
        header: {
          disableHeader: true,
        },
        pdfVerticalScrollByDefault: true,
      }}
    />
  );
}
