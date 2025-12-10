import { useQuery } from "@tanstack/react-query";
import { api, getAuthToken } from "@/lib/api";

async function queryFunction(): Promise<boolean> {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const response = await api.checkAuth.$post();

    if (response.status === 401) {
      return false;
    }

    const data = await response.json();
    return data.authenticated;
  } catch {
    return false;
  }
}

export function useCheckAuthenticated() {
  return useQuery({
    queryKey: ["checkAuthenticated"],
    queryFn: queryFunction,
    staleTime: Infinity,
  });
}
