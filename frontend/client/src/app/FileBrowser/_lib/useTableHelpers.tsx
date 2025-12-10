import useFileStore from "@/store/fileStore";
import { useState, useMemo } from "react";
import { useDownloadFile } from "@/app/FileBrowser/_lib/filesystem/useDownloadFiles";
import { useGetDirectory, type FileItem } from "@/app/FileBrowser/_lib/filesystem/useGetDirectory";

type SortField = "name" | "date" | "type" | "size";
type SortDirection = "asc" | "desc";

const useTableHelpers = () => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { selected, currentPath, setOpenDeleteModal, setSelectedContext, clearSelected } =
    useFileStore();

  const currentPathString =
    currentPath.length > 0 ? currentPath.join("/") + "/" : "";

  const { data: files = [] } = useGetDirectory(currentPathString);
  const downloadMutation = useDownloadFile();

  const getExt = (name: string) => {
    const tempName = name.split(".");
    return tempName[tempName.length - 1];
  };

  const formatDate = (date: string) => {
    const tempDate = date.split("T")[0].split("-");
    const fileDate = [tempDate[1], tempDate[2], tempDate[0]].join("/");
    const fileTime = date.split("T")[1].split(":").slice(0, 2).join(":");
    return fileDate + " " + fileTime;
  };

  // Memoized sorted files
  const sortedFiles = useMemo(() => {
    const sorted = [...files];

    sorted.sort((a: FileItem, b: FileItem) => {
      // Directories always first
      if (a.mimeType === "dir" && b.mimeType !== "dir") return -1;
      if (a.mimeType !== "dir" && b.mimeType === "dir") return 1;

      // Both are directories - sort by name
      if (a.mimeType === "dir" && b.mimeType === "dir") {
        return (a.name ?? "").localeCompare(b.name ?? "");
      }

      // Both are files - sort by selected field
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = (a.name ?? "").localeCompare(b.name ?? "");
          break;
        case "date":
          if (a.lastModified && b.lastModified) {
            const aDate = formatDate(a.lastModified);
            const bDate = formatDate(b.lastModified);
            comparison = aDate.localeCompare(bDate);
          }
          break;
        case "type":
          const aExt = getExt(a.name ?? "");
          const bExt = getExt(b.name ?? "");
          comparison = aExt.localeCompare(bExt);
          break;
        case "size":
          comparison = (a.size ?? 0) - (b.size ?? 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [files, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortByName = () => toggleSort("name");
  const sortByDate = () => toggleSort("date");
  const sortByType = () => toggleSort("type");
  const sortBySize = () => toggleSort("size");

  const saveSelected = () => {
    Array.from(selected).forEach((curr) => {
      if (curr.includes(".")) downloadMutation.mutate(curr);
    });
    clearSelected();
  };

  const deleteSelected = () => {
    setOpenDeleteModal(true);
    setSelectedContext(Array.from(selected));
    clearSelected();
  };

  return {
    sortedFiles,
    sortField,
    sortDirection,
    nameAscending: sortField === "name" && sortDirection === "asc",
    typeAscending: sortField === "type" && sortDirection === "asc",
    dateAscending: sortField === "date" && sortDirection === "asc",
    sizeAscending: sortField === "size" && sortDirection === "asc",
    setNameAscending: () => {},
    setTypeAscending: () => {},
    setDateAscending: () => {},
    setSizeAscending: () => {},
    sortByName,
    sortByDate,
    sortByType,
    sortBySize,
    saveSelected,
    deleteSelected,
  };
};

export default useTableHelpers;
