import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function downloadFile(path: string) {
  const response = await api.file.$post({
    json: { path },
  });

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  // Extract filename from path
  const splitPath = path.split("/");
  const filename = splitPath[splitPath.length - 1];

  // Trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);

  return { success: true };
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: downloadFile,
  });
}
