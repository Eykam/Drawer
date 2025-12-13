import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface UploadParams {
  files: FileList | File[];
  uploadPath: string;
}

async function uploadFiles({ files, uploadPath }: UploadParams) {
  const fileArray = Array.from(files);

  // Hono client expects a plain object for form data
  // For multiple files, we pass them as an array
  const response = await api.upload.$post({
    form: {
      uploadPath,
      files: fileArray,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error((data as { error?: string }).error || "Failed to upload files");
  }

  return response.json();
}

export function useUploadFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory"] });
    },
  });
}
