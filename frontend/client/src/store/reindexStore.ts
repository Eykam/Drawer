// Types for reindex jobs - shared between frontend components

export type JobType = "reindex" | "upload" | "delete";
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "persistent";

export interface IndexJob {
  id: number;
  job_type: JobType;
  status: JobStatus;
  total_files: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface JobProgress {
  job: IndexJob | null;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  currentFile: string | null;
  percentComplete: number;
}
