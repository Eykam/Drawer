import { useMemo, useCallback } from "react";
import { columns } from "./columns";
import { DataTable, TableActions } from "./data-table";
import { useGetDirectory } from "@/app/FileBrowser/_lib/filesystem/useGetDirectory";
import { useDownloadFile } from "@/app/FileBrowser/_lib/filesystem/useDownloadFiles";
import { useGetFile } from "@/app/FileBrowser/_lib/filesystem/useGetFile";
import useFileStore from "@/store/fileStore";

export default function ListView() {
  const {
    currentPath,
    setCurrentPath,
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
    sidebarFilter,
    setSidebarFilter,
    recents,
  } = useFileStore();
  const downloadMutation = useDownloadFile();
  const getFileMutation = useGetFile();

  const currentPathString =
    currentPath.length > 0 ? currentPath.join("/") + "/" : "";

  // Only fetch directory when in "all" mode
  const { data: files = [], isLoading, error } = useGetDirectory(
    sidebarFilter === "all" ? currentPathString : ""
  );

  // Transform FileItem to match DataTable column accessors
  const tableData = useMemo(() => {
    // For favorites/recents, convert paths to FileInfo
    if (sidebarFilter === "favorites" || sidebarFilter === "recents") {
      const paths = sidebarFilter === "favorites" ? favorites : recents;
      return paths.map((path) => {
        const isDir = path.endsWith("/");
        const parts = path.replace(/\/$/, "").split("/");
        const displayName = parts[parts.length - 1] || path;

        return {
          name: displayName,
          fullPath: path,
          type: isDir ? "Folder" : "File",
          size: 0,
          date: "",
          isDirectory: isDir,
        };
      });
    }

    // Normal directory view
    return files.map((file) => {
      const name = file.name ?? "";
      const isDir = file.mimeType === "dir";

      // Extract display name from path
      let displayName = name;
      if (isDir) {
        // For directories like "folder/", extract "folder"
        const parts = name.split("/").filter(Boolean);
        displayName = parts[parts.length - 1] || name;
      } else {
        // For files like "folder/file.txt", extract "file.txt"
        const parts = name.split("/");
        displayName = parts[parts.length - 1] || name;
      }

      return {
        name: displayName,
        fullPath: name,
        type: isDir ? "Folder" : (typeof file.mimeType === "string" ? file.mimeType : "Unknown"),
        size: file.size ?? 0,
        date: file.lastModified ?? "",
        isDirectory: isDir,
      };
    });
  }, [files, sidebarFilter, favorites, recents]);

  const actions: TableActions = useMemo(() => ({
    onDownload: (fullPath: string) => {
      downloadMutation.mutate(fullPath);
    },
    onRename: (fullPath: string) => {
      setSelectedContext([fullPath]);
      setOpenRename(true);
    },
    onDelete: (fullPath: string) => {
      setSelectedContext([fullPath]);
      setOpenDeleteModal(true);
    },
    onNavigate: (fullPath: string) => {
      addToRecents(fullPath);
      // Switch to All Files view when navigating to a directory
      if (sidebarFilter !== "all") {
        setSidebarFilter("all");
      }
      const pathParts = fullPath.split("/").filter(Boolean);
      setCurrentPath(pathParts);
    },
    onView: (fullPath: string) => {
      addToRecents(fullPath);
      setCurrFilename(fullPath);
      setOpenModal(true);
      getFileMutation.mutate(fullPath, {
        onSuccess: (data) => {
          setSelectedDocs([data.blob]);
        },
      });
    },
    onToggleFavorite: (fullPath: string) => {
      if (favorites.includes(fullPath)) {
        removeFromFavorites(fullPath);
      } else {
        addToFavorites(fullPath);
      }
    },
    isFavorite: (fullPath: string) => favorites.includes(fullPath),
  }), [downloadMutation, setSelectedContext, setOpenRename, setOpenDeleteModal, setCurrentPath, getFileMutation, setCurrFilename, setOpenModal, setSelectedDocs, favorites, addToFavorites, removeFromFavorites, addToRecents, sidebarFilter, setSidebarFilter]);

  if (sidebarFilter === "all" && isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="flex items-center justify-center h-24">Loading...</div>
      </div>
    );
  }

  if (sidebarFilter === "all" && error) {
    return (
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="flex items-center justify-center h-24 text-red-500">
          Error loading files: {error.message}
        </div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          {sidebarFilter === "favorites" && "No favorites yet. Right-click on a file or folder to add it to favorites."}
          {sidebarFilter === "recents" && "No recent files yet. Open a file or folder to see it here."}
          {sidebarFilter === "all" && "This folder is empty."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full min-h-0">
      <DataTable columns={columns} data={tableData} actions={actions} />
    </div>
  );
}
