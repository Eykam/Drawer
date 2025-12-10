import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import useFileStore from "@/store/fileStore";
import { useGetFile } from "@/app/FileBrowser/_lib/filesystem/useGetFile";
import { useDownloadFile } from "@/app/FileBrowser/_lib/filesystem/useDownloadFiles";
import DocumentViewer from "./document-viewer";

export default function FileViewerModal() {
  const { openModal, setOpenModal, currFilename, setCurrFilename, selectedDocs, setSelectedDocs } = useFileStore();
  const getFileMutation = useGetFile();
  const downloadMutation = useDownloadFile();

  // Clean up blob URLs when modal closes
  useEffect(() => {
    if (!openModal) {
      selectedDocs.forEach((blob) => {
        URL.revokeObjectURL(URL.createObjectURL(blob));
      });
    }
  }, [openModal]);

  const handleClose = () => {
    setOpenModal(false);
    setCurrFilename("");
    setSelectedDocs([]);
  };

  const handleDownload = () => {
    if (currFilename) {
      downloadMutation.mutate(currFilename);
    }
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full flex flex-col p-0 gap-0 [&>button]:hidden">
        <DialogTitle className="sr-only">File Viewer</DialogTitle>

        <div className="flex items-center justify-end gap-2 p-2 border-b shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            title="Download file"
            className="h-8 w-8"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            title="Close"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 min-h-0">
          {getFileMutation.isPending ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading file...</div>
            </div>
          ) : getFileMutation.isError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">Failed to load file</div>
            </div>
          ) : selectedDocs.length > 0 ? (
            <DocumentViewer selectedDocs={selectedDocs} filename={currFilename} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">No file selected</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
