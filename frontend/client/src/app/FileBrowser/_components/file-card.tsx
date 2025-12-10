import { HTMLAttributes } from "react";
import Icons from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FileInfo } from "@/types";
import { Folder, File } from "lucide-react";
import useFileStore from "@/store/fileStore";
import { useDownloadFile } from "@/app/FileBrowser/_lib/filesystem/useDownloadFiles";
import { useGetFile } from "@/app/FileBrowser/_lib/filesystem/useGetFile";

type FileCardProps = HTMLAttributes<HTMLDivElement> & FileInfo & {
  onNavigate?: (path: string) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function FileCard({
  name,
  fullPath,
  size,
  type,
  date,
  isDirectory,
  onNavigate,
}: FileCardProps) {
  const { setSelectedContext, setOpenRename, setOpenDeleteModal, setOpenModal, setCurrFilename, setSelectedDocs } = useFileStore();
  const downloadMutation = useDownloadFile();
  const getFileMutation = useGetFile();

  const handleOpen = () => {
    if (isDirectory && onNavigate) {
      onNavigate(fullPath);
    }
  };

  const handleViewFile = () => {
    if (!isDirectory) {
      setCurrFilename(fullPath);
      setOpenModal(true);
      getFileMutation.mutate(fullPath, {
        onSuccess: (data) => {
          setSelectedDocs([data.blob]);
        },
      });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDirectory) {
      downloadMutation.mutate(fullPath);
    }
  };

  const handleRename = () => {
    setSelectedContext([fullPath]);
    setOpenRename(true);
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedContext([fullPath]);
    setOpenDeleteModal(true);
  };

  const handleCardClick = () => {
    if (isDirectory) {
      handleOpen();
    } else {
      handleViewFile();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="bg-background rounded-md shadow-sm overflow-hidden group w-full h-full max-w-[330px] cursor-pointer border-primary/40 border"
        onClick={handleCardClick}
      >
        <div className="block relative">
          <div className="w-full h-40 bg-muted flex items-center justify-center group-hover:opacity-80 transition-opacity">
            {isDirectory ? (
              <Folder className="w-16 h-16 text-yellow-500" />
            ) : (
              <File className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {!isDirectory && (
              <Button variant="ghost" size="icon" className="text-white" onClick={handleDownload}>
                <Icons.DownloadIcon className="w-5 h-5" />
                <span className="sr-only">Download</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="text-white" onClick={(e) => { e.stopPropagation(); handleRename(); }}>
              <Icons.ShareIcon className="w-5 h-5" />
              <span className="sr-only">Rename</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={handleDelete}>
              <Icons.TrashIcon className="w-5 h-5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-2 text-muted-foreground text-sm">
          <div className="flex items-center justify-between">
            <p className="text-primary font-semibold truncate">{name}</p>
            <p className="text-primary font-semibold">
              {isDirectory ? "-" : formatFileSize(size)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p>{isDirectory ? "Folder" : type}</p>
            <p>{formatDate(date)}</p>
          </div>
        </div>

        <ContextMenuContent className="w-48">
          {isDirectory ? (
            <ContextMenuItem onClick={handleOpen}>Open</ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem onClick={handleViewFile}>View</ContextMenuItem>
              <ContextMenuItem onClick={handleDownload}>Download</ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
          <ContextMenuItem className="text-red-600" onClick={() => handleDelete()}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
