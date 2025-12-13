import { useState, useCallback, DragEvent } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import Controls from "./controls";
import GridView from "./file-grid-view";
import ListView from "./ListView/page";
import useFileStore, { ViewModes } from "@/store/fileStore";
import DirectoryBreadcrumb from "./directory-breadcrumb";
import Search from "./search";
import FileViewerModal from "./file-viewer-modal";
import DeleteConfirmModal from "./delete-confirm-modal";
import RenameConfirmModal from "./rename-confirm-modal";
import { useUploadFiles } from "@/app/FileBrowser/_lib/filesystem/useUploadFiles";

export default function FilesContainer() {
  const { viewMode, currentPath } = useFileStore();
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadFiles();

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the container entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const uploadPath = currentPath.length > 0 ? currentPath.join("/") + "/" : "";

      uploadMutation.mutate(
        { files, uploadPath },
        {
          onSuccess: () => {
            toast.success(`Uploaded ${files.length} file${files.length > 1 ? "s" : ""}`);
          },
          onError: (error) => {
            toast.error(`Upload failed: ${error.message}`);
          },
        }
      );
    },
    [currentPath, uploadMutation]
  );

  return (
    <div
      className="flex-1 flex flex-col p-6 pt-2 w-full h-full min-h-0 overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="w-12 h-12" />
            <p className="text-lg font-medium">Drop files to upload</p>
            <p className="text-sm text-muted-foreground">
              Files will be uploaded to {currentPath.length > 0 ? `/${currentPath.join("/")}` : "root"}
            </p>
          </div>
        </div>
      )}

      <ContextMenu>
        <ContextMenuTrigger className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-background border-b flex items-center h-16 shrink-0 sticky top-0 left-0 z-40">
              <Search />
              <Controls />
            </div>

            <DirectoryBreadcrumb />

            <div className="flex-1 flex flex-col min-h-0">
              {viewMode === ViewModes.Grid ? <GridView /> : <ListView />}
            </div>
          </div>

          <ContextMenuContent>
            <ContextMenuItem>Create Folder</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuTrigger>
      </ContextMenu>

      <FileViewerModal />
      <DeleteConfirmModal />
      <RenameConfirmModal />
    </div>
  );
}
