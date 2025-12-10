import { useMemo, useCallback } from "react";
import { FileInfo } from "@/types";
import FileCard from "./file-card";
import { useGetDirectory } from "@/app/FileBrowser/_lib/filesystem/useGetDirectory";
import useFileStore from "@/store/fileStore";

export default function GridView() {
  const { currentPath, setCurrentPath } = useFileStore();

  const currentPathString =
    currentPath.length > 0 ? currentPath.join("/") + "/" : "";

  const { data: files = [], isLoading, error } = useGetDirectory(currentPathString);

  // Transform FileItem to FileInfo
  const gridData = useMemo(() => {
    return files.map((file): FileInfo => {
      const name = file.name ?? "";
      const isDir = file.mimeType === "dir";

      // Extract display name from path
      let displayName = name;
      if (isDir) {
        const parts = name.split("/").filter(Boolean);
        displayName = parts[parts.length - 1] || name;
      } else {
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
  }, [files]);

  const handleNavigate = useCallback((fullPath: string) => {
    // fullPath is like "folder/" - convert to path array
    const pathParts = fullPath.split("/").filter(Boolean);
    setCurrentPath(pathParts);
  }, [setCurrentPath]);

  if (isLoading) {
    return (
      <div className="relative max-h-[85%] overflow-y-scroll">
        <div className="flex items-center justify-center h-24">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative max-h-[85%] overflow-y-scroll">
        <div className="flex items-center justify-center h-24 text-red-500">
          Error loading files: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-h-[85%] overflow-y-scroll">
      <div className="flex max-md:flex-col md:flex-wrap gap-6 items-center">
        {gridData.map((file, index) => (
          <FileCard
            {...file}
            key={index + file.name}
            className="z-10"
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
}
