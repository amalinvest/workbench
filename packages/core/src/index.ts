import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export { createApiRoutes } from "./api/router";
export { QueueManager } from "./core/queue-manager";
export type {
  ActivityBucket,
  ActivityStatsResponse,
  CreateFlowChildRequest,
  CreateFlowRequest,
  DelayedJobInfo,
  DelayedSortField,
  FailingJobType,
  FlowNode,
  FlowSummary,
  HourlyBucket,
  JobInfo,
  JobStatus,
  JobTags,
  MetricsResponse,
  OverviewStats,
  PaginatedResponse,
  QueueInfo,
  QueueMetrics,
  RepeatableSortField,
  RunInfo,
  RunInfoList,
  RunSortField,
  SchedulerInfo,
  SearchResult,
  SlowestJob,
  SortDirection,
  SortOptions,
  TestJobRequest,
  WorkbenchOptions,
  WorkerInfo,
} from "./core/types";
export { WorkbenchCore } from "./core/workbench";

/**
 * Absolute filesystem path to the bundled UI assets (index.html + /assets).
 * Adapters should serve static files from this directory.
 */
export const UI_DIST_PATH = join(dirname(fileURLToPath(import.meta.url)), "ui");
