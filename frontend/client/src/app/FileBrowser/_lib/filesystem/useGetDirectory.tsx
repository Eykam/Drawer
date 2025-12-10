import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface FileItem {
  name?: string;
  mimeType: string | false;
  lastModified?: string;
  size?: number;
}

async function fetchDirectory(path: string): Promise<FileItem[]> {
  const response = await api.directory.$post({
    json: { path },
  });

  if (response.status === 404) {
    throw new Error("Directory not found");
  }

  const data = await response.json();

  if ("error" in data) {
    throw new Error(data.error);
  }

  // Sort: directories first, then alphabetically
  return data.sort((a, b) => {
    if (a.mimeType === "dir" && b.mimeType !== "dir") return -1;
    if (a.mimeType !== "dir" && b.mimeType === "dir") return 1;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

export function useGetDirectory(path: string) {
  return useQuery({
    queryKey: ["directory", path],
    queryFn: () => fetchDirectory(path),
  });
}
