import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function createDirectory(name: string) {
  const response = await api.mkdir.$post({
    json: { name },
  });

  if (!response.ok) {
    throw new Error("Failed to create directory");
  }

  return response.json();
}

export function useCreateDirectory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDirectory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory"] });
    },
  });
}
