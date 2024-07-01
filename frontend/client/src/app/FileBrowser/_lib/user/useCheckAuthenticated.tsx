import { QueryOptions, useQuery } from "@tanstack/react-query";
import { URLs } from "@/config/urls";

type AuthParams = {
  queryKeys?: {};
};

async function queryFunction({
  queryKey,
}: Partial<AuthParams & QueryOptions>): Promise<boolean> {
  const response = await fetch(URLs.baseURL + URLs.checkAuth, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "include",
  });

  if (response.status === 403) {
    return false;
  } else if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error("Not Authenticated!\n" + errorMessage);
  }

  return true;
}

export function useCheckAuthenticated(params: AuthParams) {
  const QUERY_KEY = ["checkAuthenticated", { ...params.queryKeys }] as const;

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: (e) => queryFunction({ ...e, ...params }),
    staleTime: Infinity,
  });
}
