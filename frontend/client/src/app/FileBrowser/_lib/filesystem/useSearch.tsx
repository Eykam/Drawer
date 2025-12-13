import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SearchResult {
  path: string;
  filename: string;
  mimeType: string;
  size: number;
  lastModified: string;
  score: number;
  type: "file" | "directory";
}

interface SearchResponse {
  results: SearchResult[];
}

async function searchFiles(query: string, limit: number = 20): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await api.search.$post({
    json: { query, limit },
  });

  if (!response.ok) {
    throw new Error("Search failed");
  }

  const data = (await response.json()) as SearchResponse;
  return data.results;
}

export function useSearch(query: string, limit: number = 20) {
  return useQuery({
    queryKey: ["search", query, limit],
    queryFn: () => searchFiles(query, limit),
    enabled: query.trim().length > 0,
    staleTime: 30000, // Cache results for 30 seconds
  });
}
