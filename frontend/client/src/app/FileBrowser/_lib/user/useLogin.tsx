import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../lib/queryClient";
import { api, setAuthToken } from "@/lib/api";

type LoginParams = {
  username: string;
  password: string;
};

async function mutationFunction({ username, password }: LoginParams) {
  const response = await api.login.$post({
    json: { username, password },
  });

  const data = await response.json();

  if (data.status === "failure" || !response.ok) {
    throw new Error("Failed to log in!");
  }

  if (data.status === "success" && data.token) {
    setAuthToken(data.token);
  }

  return data;
}

export function useLogin() {
  return useMutation({
    mutationFn: (params: LoginParams) => mutationFunction(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkAuthenticated"] });
    },
  });
}
