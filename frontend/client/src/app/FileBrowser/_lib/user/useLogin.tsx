import { useMutation, MutationOptions } from "@tanstack/react-query";
import { URLs } from "@/config/urls";
import { queryClient } from "../../../../lib/queryClient";

type LoginParams = {
  username: string;
  password: string;
};

async function mutationFunction({
  username,
  password,
}: Partial<LoginParams & MutationOptions>): Promise<void> {
  const response = await fetch(URLs.baseURL + URLs.logIn, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    mode: "cors",
    credentials: "include",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error("Failed to log in!\n" + errorMessage);
  }

  return;
}

export function useLogin() {
  return useMutation({
    mutationFn: (params: Partial<LoginParams & MutationOptions>) =>
      mutationFunction({ ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkAuthenticated"] });
    },
  });
}
