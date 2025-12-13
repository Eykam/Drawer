import { useState, useRef, useEffect } from "react";
import Icons from "@/components/Icons";
import { Input } from "@/components/ui/input";
import { useSearch, SearchResult } from "@/app/FileBrowser/_lib/filesystem/useSearch";
import { useGetFile } from "@/app/FileBrowser/_lib/filesystem/useGetFile";
import useFileStore from "@/store/fileStore";
import { File, Folder, Loader2 } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useSearch(query);
  const { setCurrentPath, setOpenModal, setCurrFilename, setSelectedDocs } = useFileStore();
  const getFileMutation = useGetFile();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "directory") {
      // Navigate to the directory
      const pathParts = result.path.split("/").filter(Boolean);
      setCurrentPath(pathParts);
    } else {
      // First navigate to the parent folder
      const pathParts = result.path.split("/").filter(Boolean);
      pathParts.pop(); // Remove the filename to get parent directory
      setCurrentPath(pathParts);

      // Then open file viewer
      setCurrFilename(result.path);
      setOpenModal(true);
      getFileMutation.mutate(result.path, {
        onSuccess: (data) => {
          setSelectedDocs([data.blob]);
        },
      });
    }

    setQuery("");
    setIsOpen(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "-";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  return (
    <div className="relative flex-1">
      <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search files..."
        className="pl-10 w-full rounded-md bg-muted focus:bg-background"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query.trim() && setIsOpen(true)}
      />

      {/* Search Results Dropdown */}
      {isOpen && query.trim() && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          ) : (
            <ul className="py-1">
              {results.map((result, index) => (
                <li
                  key={`${result.path}-${index}`}
                  className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-3"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === "directory" ? (
                    <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.filename}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.path}
                    </p>
                  </div>
                  {result.type === "file" && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatFileSize(result.size)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
