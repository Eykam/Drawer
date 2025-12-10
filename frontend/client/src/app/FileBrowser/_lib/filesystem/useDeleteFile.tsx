import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function deleteFiles(names: string[]) {
  const response = await api.delete.$post({
    json: { names },
  });

  if (!response.ok) {
    throw new Error("Failed to delete files");
  }

  return response.json();
}

export function useDeleteFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory"] });
    },
  });
}
