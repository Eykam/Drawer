import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/api";
import type { JobProgress } from "@/store/reindexStore";

interface JobsResponse {
  jobs: JobProgress[];
}

async function fetchReindexJobs(limit: number = 10): Promise<JobProgress[]> {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`/api/reindex/jobs?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: JobsResponse = await response.json();
  return data.jobs;
}

async function startReindexJob(): Promise<{ success: boolean; jobId: number; totalFiles: number }> {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch("/api/reindex/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Reindex already in progress");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function cancelReindexJob(): Promise<{ success: boolean }> {
  const token = getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch("/api/reindex/cancel", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export function useReindexJobs(limit: number = 10) {
  const jobs = useQuery({
    queryKey: ["reindex", "jobs", limit],
    queryFn: () => fetchReindexJobs(limit),
    staleTime: 1000, // Refresh every 1 second
    refetchInterval: (query) => {
      // Poll every second if there are pending items in any job (including persistent jobs)
      const data = query.state.data;
      const hasPendingItems = data?.some(
        (job) => job.pending > 0 || job.processing > 0
      );
      return hasPendingItems ? 1000 : false;
    },
  });

  // Separate persistent jobs from reindex jobs
  const persistentJobs = jobs.data?.filter(
    (job) => job.job?.status === "persistent"
  ) ?? [];

  const reindexJobs = jobs.data?.filter(
    (job) => job.job?.job_type === "reindex"
  ) ?? [];

  // Check if any reindex job is currently running
  const isRunning = reindexJobs.some(
    (job) => job.job?.status === "pending" || job.job?.status === "processing"
  );

  // Get the latest active reindex job for progress display
  const activeJob = reindexJobs.find(
    (job) => job.job?.status === "pending" || job.job?.status === "processing"
  );

  // Get upload and delete jobs specifically
  const uploadJob = persistentJobs.find((job) => job.job?.job_type === "upload");
  const deleteJob = persistentJobs.find((job) => job.job?.job_type === "delete");

  return {
    ...jobs,
    reindexJobs,
    persistentJobs,
    uploadJob: uploadJob ?? null,
    deleteJob: deleteJob ?? null,
    isRunning,
    activeJob: activeJob ?? null,
  };
}

export function useStartReindex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startReindexJob,
    onSuccess: () => {
      // Invalidate jobs query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["reindex", "jobs"] });
    },
  });
}

export function useCancelReindex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReindexJob,
    onSuccess: () => {
      // Invalidate jobs query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["reindex", "jobs"] });
    },
  });
}
