import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface RenameParams {
  source: string;
  dest: string;
  type: "file" | "dir";
}

async function renameFile({ source, dest, type }: RenameParams) {
  const response = await api.rename.$post({
    json: { source, dest, type },
  });

  if (!response.ok) {
    throw new Error("Failed to rename");
  }

  return response.json();
}

export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory"] });
    },
  });
}
