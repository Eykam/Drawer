import { Button } from "@/components/ui/button";
import {
  useReindexJobs,
  useStartReindex,
  useCancelReindex,
} from "@/app/FileBrowser/_lib/settings/useReindex";
import type { JobProgress } from "@/store/reindexStore";
import {
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Ban,
  Upload,
  Trash2,
} from "lucide-react";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString();
}

function JobStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Completed
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <Ban className="h-3 w-3" />
          Cancelled
        </span>
      );
    case "persistent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          <RefreshCw className="h-3 w-3" />
          Active
        </span>
      );
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>;
  }
}

function PersistentJobCard({
  job,
  title,
  icon: Icon,
  description,
}: {
  job: JobProgress | null;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  const hasPending = job && (job.pending > 0 || job.processing > 0);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">{title}</h3>
        </div>
        {job?.job && <JobStatusBadge status={job.job.status} />}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {job && (
        <div className="space-y-2">
          {hasPending ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${job.percentComplete}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {job.percentComplete}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {job.processing > 0 && (
                  <span className="text-blue-600">{job.processing} processing</span>
                )}
                {job.pending > 0 && (
                  <span className="ml-2">{job.pending} pending</span>
                )}
              </p>
              {job.currentFile && (
                <p className="text-xs text-muted-foreground truncate">
                  {job.currentFile}
                </p>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              <span className="text-green-600">{job.completed} completed</span>
              {job.failed > 0 && (
                <span className="text-red-600 ml-2">{job.failed} failed</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: JobProgress }) {
  if (!job.job) return null;

  const isActive =
    job.job.status === "pending" || job.job.status === "processing";

  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <JobStatusBadge status={job.job.status} />
      </td>
      <td className="py-3 px-4">
        {isActive ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${job.percentComplete}%` }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">
                {job.percentComplete}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {job.completed + job.failed} / {job.total} files
            </p>
            {job.currentFile && (
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {job.currentFile}
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm">
            <span className="text-green-600">{job.completed} indexed</span>
            {job.failed > 0 && (
              <span className="text-red-600 ml-2">{job.failed} failed</span>
            )}
            <span className="text-muted-foreground ml-2">/ {job.total} total</span>
          </div>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {formatDate(job.job.created_at)}
      </td>
    </tr>
  );
}

export default function SettingsPage() {
  const { isLoading, isRunning, activeJob, reindexJobs, uploadJob, deleteJob } = useReindexJobs(10);
  const startMutation = useStartReindex();
  const cancelMutation = useCancelReindex();

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Manual Reindex Section */}
        <section className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Manual Reindex</h2>
            <p className="text-sm text-muted-foreground">
              Rebuild the search index for all files in your storage. This enables
              semantic search across your documents.
            </p>
          </div>

          {/* Active Job Progress */}
          {activeJob && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Indexing in progress...</span>
                <span className="text-sm font-medium">{activeJob.percentComplete}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${activeJob.percentComplete}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {activeJob.completed + activeJob.failed} / {activeJob.total} files
                </span>
                {activeJob.currentFile && (
                  <span className="truncate max-w-xs">{activeJob.currentFile}</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => startMutation.mutate()}
              disabled={isRunning || startMutation.isPending}
            >
              {startMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rebuild Search Index
                </>
              )}
            </Button>

            {isRunning && (
              <Button
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Cancel
              </Button>
            )}
          </div>
        </section>

        {/* Reindex Jobs History */}
        <section className="border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold">Reindex Jobs History</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading jobs...
            </div>
          ) : reindexJobs.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium">Status</th>
                  <th className="py-2 px-4 text-left text-sm font-medium">Progress</th>
                  <th className="py-2 px-4 text-left text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {reindexJobs.map((job) =>
                  job.job ? <JobRow key={job.job.id} job={job} /> : null
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No reindex jobs yet. Click "Rebuild Search Index" to start.
            </div>
          )}
        </section>

        {/* Background Index Jobs Section */}
        <section className="border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Background Index Jobs</h2>
            <p className="text-sm text-muted-foreground">
              Files are automatically indexed when uploaded and removed from the index when deleted.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PersistentJobCard
              job={uploadJob}
              title="Upload Indexing"
              icon={Upload}
              description="New files are queued for indexing when uploaded."
            />
            <PersistentJobCard
              job={deleteJob}
              title="Delete Cleanup"
              icon={Trash2}
              description="Deleted files are removed from the search index."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
