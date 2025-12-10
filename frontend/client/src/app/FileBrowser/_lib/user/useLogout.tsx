import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../lib/queryClient";
import { api, clearAuthToken } from "@/lib/api";

async function mutationFunction() {
  const response = await api.logout.$post();

  if (!response.ok) {
    throw new Error("Failed to logout!");
  }

  clearAuthToken();

  return response.json();
}

export function useLogout() {
  return useMutation({
    mutationFn: mutationFunction,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checkAuthenticated"] });
    },
  });
}
