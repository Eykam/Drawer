import { HTMLAttributes } from "react";
import Icons from "@/components/Icons";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileInfo } from "@/types";
import { Folder, File, MoreVertical, Star } from "lucide-react";
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
  const {
    setSelectedContext,
    setOpenRename,
    setOpenDeleteModal,
    setOpenModal,
    setCurrFilename,
    setSelectedDocs,
    favorites,
    addToFavorites,
    removeFromFavorites,
    addToRecents,
  } = useFileStore();
  const downloadMutation = useDownloadFile();
  const getFileMutation = useGetFile();

  const isFavorite = favorites.includes(fullPath);

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isFavorite) {
      removeFromFavorites(fullPath);
    } else {
      addToFavorites(fullPath);
    }
  };

  const handleOpen = () => {
    if (isDirectory && onNavigate) {
      addToRecents(fullPath);
      onNavigate(fullPath);
    }
  };

  const handleViewFile = () => {
    if (!isDirectory) {
      addToRecents(fullPath);
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
        className="bg-background rounded-md shadow-sm overflow-hidden group w-full h-full max-w-[330px] cursor-pointer border-primary/40 border relative"
        onClick={handleCardClick}
      >
        {/* 3-dot menu in top right */}
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isDirectory ? (
                <DropdownMenuItem onClick={handleOpen}>Open</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleViewFile}>View</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>Download</DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleFavorite}>
                <Star className={`h-4 w-4 mr-2 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename}>Rename</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete()}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="block">
          <div className="w-full h-40 bg-muted flex items-center justify-center group-hover:opacity-80 transition-opacity">
            {isDirectory ? (
              <Folder className="w-16 h-16 text-yellow-500" />
            ) : (
              <File className="w-16 h-16 text-gray-400" />
            )}
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

        <ContextMenuContent className="w-56">
          {isDirectory ? (
            <ContextMenuItem onClick={handleOpen}>Open</ContextMenuItem>
          ) : (
            <>
              <ContextMenuItem onClick={handleViewFile}>View</ContextMenuItem>
              <ContextMenuItem onClick={handleDownload}>Download</ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={handleToggleFavorite}>
            <Star className={`h-4 w-4 mr-2 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </ContextMenuItem>
          <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
          <ContextMenuItem className="text-red-600" onClick={() => handleDelete()}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuTrigger>
    </ContextMenu>
  );
}
