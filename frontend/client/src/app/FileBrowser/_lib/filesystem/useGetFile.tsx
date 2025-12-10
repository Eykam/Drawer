import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ViewFileResult {
  blob: Blob;
  filename: string;
}

async function getFile(path: string): Promise<ViewFileResult> {
  const response = await api.file.$post({
    json: { path },
  });

  if (!response.ok) {
    throw new Error("Failed to get file");
  }

  const blob = await response.blob();

  // Extract filename from path
  const splitPath = path.split("/");
  const filename = splitPath[splitPath.length - 1];

  return { blob, filename };
}

export function useGetFile() {
  return useMutation({
    mutationFn: getFile,
  });
}
