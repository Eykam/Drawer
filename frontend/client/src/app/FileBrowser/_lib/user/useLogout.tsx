import { useMutation } from "@tanstack/react-query";
import { URLs } from "@/config/urls";
import { queryClient } from "../../../../lib/queryClient";

async function mutationFunction(): Promise<void> {
  const response = await fetch(URLs.baseURL + URLs.logOut, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "include",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error("Failed to logout!\n" + errorMessage);
  }

  return;
}

export function useLogout() {
  return useMutation({
    mutationFn: mutationFunction,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checkAuthenticated"] });
    },
  });
}
