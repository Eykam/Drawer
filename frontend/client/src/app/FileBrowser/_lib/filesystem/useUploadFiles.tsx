import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface UploadParams {
  files: FileList;
  uploadPath: string;
}

async function uploadFiles({ files, uploadPath }: UploadParams) {
  const formData = new FormData();
  formData.append("uploadPath", uploadPath);

  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  const response = await api.upload.$post({
    form: formData as unknown as Record<string, string | Blob>,
  });

  if (!response.ok) {
    throw new Error("Failed to upload files");
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
