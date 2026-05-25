import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  FlaskConical,
  Layers,
  Network,
  Pause,
  Play,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import type { ReactNode, SVGProps } from "react";

/**
 * Inline dashboard mockups that mirror the real Workbench UI: sharp corners,
 * neon status colors, Geist mono for numbers — same design tokens as
 * `packages/core/src/ui/styles/globals.css`. Kept as React (not raster
 * screenshots) so they stay sharp at every resolution and never get stale
 * when the real UI evolves.
 */

const TOTAL_HEIGHT = 480;

/* -------------------------------------------------------------------------- */
/* Shared chrome — title bar + sidebar that all mockups reuse                 */
/* -------------------------------------------------------------------------- */

function MockTitleBar({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex h-8 items-center justify-between border-b border-(--mock-line-1) bg-(--mock-surface) px-3 text-[11px]">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="font-mono text-[10px] tracking-tight text-(--mock-fg-5)">
        {subtitle}
      </div>
      <div className="flex items-center gap-2 text-(--mock-fg-5)">
        <Search className="h-3 w-3" />
        <Settings className="h-3 w-3" />
      </div>
    </div>
  );
}

interface SidebarItem {
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
  active?: boolean;
  badge?: string;
}

function MockSidebar({ active }: { active: string }) {
  const items: SidebarItem[] = [
    {
      label: "Overview",
      icon: BarChart3 as never,
      active: active === "Overview",
    },
    {
      label: "Runs",
      icon: Activity as never,
      active: active === "Runs",
      badge: "12",
    },
    { label: "Flows", icon: Network as never, active: active === "Flows" },
    {
      label: "Schedulers",
      icon: Clock as never,
      active: active === "Schedulers",
    },
    { label: "Metrics", icon: Zap as never, active: active === "Metrics" },
    { label: "Test", icon: FlaskConical as never, active: active === "Test" },
  ];

  return (
    <div className="flex w-44 shrink-0 flex-col border-r border-(--mock-line-1) bg-(--mock-surface) py-3">
      <div className="px-3 pb-3 text-[9px] font-medium uppercase tracking-[0.18em] text-(--mock-fg-6)">
        Queues
      </div>
      <div className="space-y-px px-1.5">
        {["email", "image-processing", "billing", "webhooks"].map((q, i) => (
          <div
            key={q}
            className={`flex items-center justify-between px-2 py-1 text-[11px] ${
              i === 1
                ? "bg-(--mock-surface-hi) text-(--mock-fg-1)"
                : "text-(--mock-fg-4)"
            }`}
          >
            <span className="truncate font-mono">{q}</span>
            <span className="ml-2 font-mono text-[10px] text-(--mock-fg-5)">
              {[12, 47, 3, 18][i]}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 px-3 pb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-(--mock-fg-6)">
        Views
      </div>
      <nav className="space-y-px px-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-2 px-2 py-1 text-[11px] ${
                item.active
                  ? "bg-(--mock-surface-hi) text-(--mock-fg-1)"
                  : "text-(--mock-fg-4)"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
              </span>
              {item.badge && (
                <span className="rounded-sm bg-(--mock-surface-hi) px-1 py-px font-mono text-[9px] text-(--mock-fg-3)">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function MockChrome({
  active,
  subtitle,
  children,
  withSidebar = true,
  bleed = false,
}: {
  active: string;
  subtitle: string;
  children: ReactNode;
  withSidebar?: boolean;
  /**
   * When true, the mockup is drawn as if it continues past the bottom edge
   * of the page section: rounded *only* at the top, no border on the
   * bottom, no drop shadow. Use it for the hero screenshot so the
   * dashboard reads as "more below — keep scrolling" instead of a floating
   * card.
   */
  bleed?: boolean;
}) {
  const frame = bleed
    ? "overflow-hidden rounded-t-xl border border-b-0 border-(--mock-line-1) bg-(--mock-bg) text-(--mock-fg-1)"
    : "mockup-frame overflow-hidden rounded-xl border border-(--mock-line-1) bg-(--mock-bg) text-(--mock-fg-1)";

  return (
    <div className={frame} style={{ height: TOTAL_HEIGHT }}>
      <MockTitleBar subtitle={subtitle} />
      <div className="flex h-[calc(100%-2rem)]">
        {withSidebar && <MockSidebar active={active} />}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

export function OverviewMockup({ bleed = false }: { bleed?: boolean } = {}) {
  const cards = [
    {
      label: "Completed",
      value: "184,392",
      delta: "+12.4%",
      color: "text-(--status-success)",
    },
    {
      label: "Failed",
      value: "287",
      delta: "-3.1%",
      color: "text-(--status-failed)",
    },
    {
      label: "Active",
      value: "47",
      delta: "+8/min",
      color: "text-(--status-active)",
    },
    {
      label: "Waiting",
      value: "1,204",
      delta: "stable",
      color: "text-(--status-waiting)",
    },
  ];

  return (
    <MockChrome
      active="Overview"
      subtitle="redis://127.0.0.1:6379 · 4 queues"
      bleed={bleed}
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-3">
          <div className="text-[13px] font-medium tracking-tight">
            image-processing
          </div>
          <div className="font-mono text-[10px] text-(--mock-fg-5)">
            47 active · 1,204 waiting · last 24h
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {cards.map((c) => (
            <div
              key={c.label}
              className="border border-(--mock-line-2) bg-(--mock-surface) p-2.5"
            >
              <div className="text-[9px] uppercase tracking-[0.14em] text-(--mock-fg-5)">
                {c.label}
              </div>
              <div className="mt-1 font-mono text-[18px] leading-none text-(--mock-fg-1)">
                {c.value}
              </div>
              <div className={`mt-1 font-mono text-[10px] ${c.color}`}>
                {c.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex-1 border border-(--mock-line-2) bg-(--mock-bg-2) p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] text-(--mock-fg-5)">
            <span className="uppercase tracking-[0.14em]">
              Throughput · jobs/min
            </span>
            <div className="flex items-center gap-3 font-mono">
              <Legend color="var(--status-success)" label="completed" />
              <Legend color="var(--status-failed)" label="failed" />
            </div>
          </div>
          <ThroughputChart />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-(--mock-fg-5)">
          <Stat label="p50 wait" value="12ms" />
          <Stat label="p95 duration" value="847ms" />
        </div>
      </div>
    </MockChrome>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-1.5 w-1.5" style={{ background: color }} />
      <span>{label}</span>
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border border-(--mock-line-2) bg-(--mock-surface) px-2 py-1.5">
      <span className="uppercase tracking-[0.12em]">{label}</span>
      <span className="font-mono text-(--mock-fg-2)">{value}</span>
    </div>
  );
}

function ThroughputChart() {
  // Deterministic noise so the chart renders identically on the server and
  // client (avoids a hydration mismatch).
  const completed = [
    18, 22, 19, 28, 34, 30, 38, 42, 45, 41, 49, 52, 58, 61, 64, 60, 66, 71, 74,
    78, 82, 79, 85, 92, 88, 94, 97, 91, 95, 99,
  ];
  const failed = [
    1, 0, 2, 1, 1, 2, 1, 3, 2, 1, 2, 4, 3, 2, 5, 3, 2, 4, 6, 3, 4, 7, 5, 4, 6,
    3, 5, 8, 6, 4,
  ];

  const max = 110;
  const w = 100;
  const h = 100;
  const step = w / (completed.length - 1);

  const toPath = (data: number[]) =>
    data
      .map((v, i) => {
        const x = (i * step).toFixed(2);
        const y = (h - (v / max) * h).toFixed(2);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  const toArea = (data: number[]) => `${toPath(data)} L${w},${h} L0,${h} Z`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-[140px] w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            style={{ stopColor: "var(--status-success)" }}
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--status-success)" }}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line
          key={y}
          x1={0}
          x2={w}
          y1={h * y}
          y2={h * y}
          style={{ stroke: "var(--mock-line-2)" }}
          strokeWidth={0.3}
        />
      ))}
      <path d={toArea(completed)} fill="url(#completedFill)" />
      <path
        d={toPath(completed)}
        style={{ stroke: "var(--status-success)" }}
        strokeWidth={0.8}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={toPath(failed)}
        style={{ stroke: "var(--status-failed)" }}
        strokeWidth={0.8}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Runs                                                                       */
/* -------------------------------------------------------------------------- */

type RunStatus = "completed" | "failed" | "active" | "waiting" | "delayed";

interface Run {
  id: string;
  name: string;
  status: RunStatus;
  duration: string;
  attempts: string;
  age: string;
}

const RUNS: Run[] = [
  {
    id: "j_3aa18",
    name: "resize-thumbnail",
    status: "active",
    duration: "—",
    attempts: "1/3",
    age: "now",
  },
  {
    id: "j_3aa17",
    name: "transcode-video",
    status: "active",
    duration: "—",
    attempts: "1/3",
    age: "2s",
  },
  {
    id: "j_3aa16",
    name: "resize-thumbnail",
    status: "completed",
    duration: "284ms",
    attempts: "1/3",
    age: "8s",
  },
  {
    id: "j_3aa15",
    name: "extract-frames",
    status: "completed",
    duration: "1.2s",
    attempts: "1/3",
    age: "14s",
  },
  {
    id: "j_3aa14",
    name: "resize-thumbnail",
    status: "failed",
    duration: "1.8s",
    attempts: "3/3",
    age: "22s",
  },
  {
    id: "j_3aa13",
    name: "ocr-document",
    status: "completed",
    duration: "612ms",
    attempts: "1/3",
    age: "31s",
  },
  {
    id: "j_3aa12",
    name: "transcode-video",
    status: "completed",
    duration: "4.7s",
    attempts: "2/3",
    age: "44s",
  },
  {
    id: "j_3aa11",
    name: "send-receipt",
    status: "delayed",
    duration: "—",
    attempts: "0/3",
    age: "in 2m",
  },
  {
    id: "j_3aa10",
    name: "resize-thumbnail",
    status: "completed",
    duration: "198ms",
    attempts: "1/3",
    age: "1m",
  },
  {
    id: "j_3aa09",
    name: "extract-frames",
    status: "waiting",
    duration: "—",
    attempts: "0/3",
    age: "1m",
  },
];

const STATUS_STYLES: Record<RunStatus, { dot: string; label: string }> = {
  completed: {
    dot: "bg-(--status-success)",
    label: "text-(--status-success)",
  },
  failed: {
    dot: "bg-(--status-failed)",
    label: "text-(--status-failed)",
  },
  active: {
    dot: "bg-(--status-active)",
    label: "text-(--status-active)",
  },
  waiting: {
    dot: "bg-(--status-waiting)",
    label: "text-(--status-waiting)",
  },
  delayed: {
    dot: "bg-(--mock-fg-5)",
    label: "text-(--mock-fg-4)",
  },
};

export function RunsMockup() {
  return (
    <MockChrome
      active="Runs"
      subtitle="image-processing · last 50"
      withSidebar={false}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-(--mock-line-2) px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="text-[13px] font-medium tracking-tight">Runs</div>
            <span className="rounded-sm border border-(--mock-line-1) bg-(--mock-surface) px-1.5 py-0.5 font-mono text-[10px] text-(--mock-fg-4)">
              184,679
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { label: "All", count: "184k", active: true },
              { label: "Active", count: "47" },
              { label: "Completed", count: "184k" },
              { label: "Failed", count: "287" },
            ].map((tab) => (
              <span
                key={tab.label}
                className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] ${
                  tab.active
                    ? "border border-(--mock-surface-2a) bg-(--mock-surface-hi) text-(--mock-fg-1)"
                    : "text-(--mock-fg-5)"
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-(--mock-fg-5)">
                  {tab.count}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[18px_80px_1fr_80px_60px_56px] gap-3 border-b border-(--mock-line-2) bg-(--mock-bg-2) px-4 py-1.5 text-[9px] uppercase tracking-[0.14em] text-(--mock-fg-5)">
          <span />
          <span>Job ID</span>
          <span>Name</span>
          <span>Duration</span>
          <span>Attempts</span>
          <span className="text-right">Age</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {RUNS.map((run, i) => {
            const styles = STATUS_STYLES[run.status];
            return (
              <div
                key={run.id}
                className={`grid grid-cols-[18px_80px_minmax(0,1fr)_80px_60px_56px] gap-3 border-b border-(--mock-line-3) px-4 py-2 text-[11px] ${
                  i === 0 ? "bg-(--mock-row-hover)" : ""
                }`}
              >
                <div className="flex items-center">
                  <span className={`h-1.5 w-1.5 ${styles.dot}`} />
                </div>
                <span className="truncate font-mono text-(--mock-fg-4)">
                  {run.id}
                </span>
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate font-mono text-(--mock-fg-1)">
                    {run.name}
                  </span>
                  <span className={`shrink-0 text-[10px] ${styles.label}`}>
                    {run.status}
                  </span>
                </span>
                <span className="truncate font-mono text-(--mock-fg-3)">
                  {run.duration}
                </span>
                <span className="font-mono text-(--mock-fg-5)">
                  {run.attempts}
                </span>
                <span className="text-right font-mono text-(--mock-fg-5)">
                  {run.age}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MockChrome>
  );
}

/* -------------------------------------------------------------------------- */
/* Flows                                                                      */
/* -------------------------------------------------------------------------- */

export function FlowsMockup() {
  return (
    <MockChrome
      active="Flows"
      subtitle="order-fulfillment · flow_4f12"
      withSidebar={false}
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-(--mock-line-2) px-4 py-2">
          <div>
            <div className="text-[13px] font-medium tracking-tight">
              order-fulfillment
            </div>
            <div className="font-mono text-[10px] text-(--mock-fg-5)">
              flow_4f12 · 6 jobs · 2.4s total
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 border border-(--status-success-30) bg-(--status-success-10) px-2 py-0.5 text-[10px] text-(--status-success)">
              <CheckCircle2 className="h-3 w-3" />
              completed
            </span>
          </div>
        </div>

        <div className="dotted relative flex-1 overflow-hidden">
          <svg
            viewBox="0 0 600 360"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path
                  d="M0,0 L10,5 L0,10 z"
                  style={{ fill: "var(--mock-surface-2a)" }}
                />
              </marker>
            </defs>
            <Edge from={[110, 80]} to={[260, 80]} />
            <Edge from={[110, 180]} to={[260, 180]} />
            <Edge from={[110, 280]} to={[260, 280]} />
            <Edge from={[380, 80]} to={[460, 180]} />
            <Edge from={[380, 180]} to={[460, 180]} />
            <Edge from={[380, 280]} to={[460, 180]} />
          </svg>

          <FlowNode
            x={10}
            y={48}
            title="validate-cart"
            status="completed"
            duration="42ms"
          />
          <FlowNode
            x={10}
            y={148}
            title="charge-card"
            status="completed"
            duration="612ms"
          />
          <FlowNode
            x={10}
            y={248}
            title="reserve-stock"
            status="completed"
            duration="118ms"
          />
          <FlowNode
            x={260}
            y={48}
            title="email-receipt"
            status="completed"
            duration="287ms"
          />
          <FlowNode
            x={260}
            y={148}
            title="generate-pdf"
            status="completed"
            duration="894ms"
          />
          <FlowNode
            x={260}
            y={248}
            title="notify-warehouse"
            status="completed"
            duration="71ms"
          />
          <FlowNode
            x={460}
            y={148}
            title="finalize"
            status="completed"
            duration="33ms"
            parent
          />
        </div>
      </div>
    </MockChrome>
  );
}

function Edge({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const midX = (x1 + x2) / 2;
  return (
    <path
      d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
      style={{ stroke: "var(--mock-surface-2a)" }}
      strokeWidth={1}
      fill="none"
      markerEnd="url(#arrow)"
    />
  );
}

function FlowNode({
  x,
  y,
  title,
  status,
  duration,
  parent,
}: {
  x: number;
  y: number;
  title: string;
  status: RunStatus;
  duration: string;
  parent?: boolean;
}) {
  const styles = STATUS_STYLES[status];
  return (
    <div
      className={`absolute w-[150px] border bg-(--mock-surface) px-2.5 py-1.5 ${
        parent
          ? "border-(--status-success-40)"
          : "border-(--mock-line-1)"
      }`}
      style={{ left: `${(x / 600) * 100}%`, top: `${(y / 360) * 100}%` }}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 ${styles.dot}`} />
        <span className="truncate font-mono text-[10px] text-(--mock-fg-1)">
          {title}
        </span>
      </div>
      <div className="mt-0.5 flex justify-between font-mono text-[9px] text-(--mock-fg-5)">
        <span>{status}</span>
        <span>{duration}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Schedulers                                                                 */
/* -------------------------------------------------------------------------- */

interface Scheduler {
  name: string;
  cron: string;
  next: string;
  last: string;
  active: boolean;
}

const SCHEDULERS: Scheduler[] = [
  {
    name: "weekly-digest",
    cron: "0 9 * * MON",
    next: "in 2d 4h",
    last: "ok · 1.2s",
    active: true,
  },
  {
    name: "cleanup-stale-jobs",
    cron: "*/15 * * * *",
    next: "in 4m",
    last: "ok · 87ms",
    active: true,
  },
  {
    name: "refresh-search-index",
    cron: "0 */6 * * *",
    next: "in 1h 12m",
    last: "ok · 4.7s",
    active: true,
  },
  {
    name: "send-trial-reminders",
    cron: "0 10 * * *",
    next: "in 18h",
    last: "ok · 612ms",
    active: true,
  },
  {
    name: "rotate-credentials",
    cron: "0 0 1 * *",
    next: "in 6d",
    last: "ok · 28ms",
    active: false,
  },
  {
    name: "warm-cache",
    cron: "*/5 * * * *",
    next: "in 2m",
    last: "ok · 142ms",
    active: true,
  },
];

export function SchedulersMockup() {
  return (
    <MockChrome
      active="Schedulers"
      subtitle="email · 6 schedulers"
      withSidebar={false}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-(--mock-line-2) px-4 py-2">
          <div className="text-[13px] font-medium tracking-tight">
            Schedulers
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-(--mock-fg-5)">
            <span>6 active</span>
            <span className="h-3 w-px bg-(--mock-surface-hi)" />
            <span>next: in 2m</span>
          </div>
        </div>

        <div className="grid grid-cols-[16px_minmax(0,1fr)_110px_72px_88px] gap-3 border-b border-(--mock-line-2) bg-(--mock-bg-2) px-4 py-1.5 text-[9px] uppercase tracking-[0.14em] text-(--mock-fg-5)">
          <span />
          <span>Name</span>
          <span>Cron</span>
          <span>Next</span>
          <span>Last run</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {SCHEDULERS.map((s) => (
            <div
              key={s.name}
              className="grid grid-cols-[16px_minmax(0,1fr)_110px_72px_88px] items-center gap-3 border-b border-(--mock-line-3) px-4 py-2 text-[11px]"
            >
              <span
                className={`flex h-3 w-3 items-center justify-center ${
                  s.active
                    ? "text-(--status-success)"
                    : "text-(--mock-fg-6)"
                }`}
              >
                {s.active ? (
                  <Play className="h-2.5 w-2.5" fill="currentColor" />
                ) : (
                  <Pause className="h-2.5 w-2.5" fill="currentColor" />
                )}
              </span>
              <span className="truncate font-mono text-(--mock-fg-1)">
                {s.name}
              </span>
              <span className="truncate font-mono text-(--mock-fg-4)">
                {s.cron}
              </span>
              <span className="truncate font-mono text-(--mock-fg-3)">
                {s.next}
              </span>
              <span className="truncate font-mono text-(--mock-fg-5)">
                {s.last}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

/* -------------------------------------------------------------------------- */
/* Test panel — compact, no sidebar                                           */
/* -------------------------------------------------------------------------- */

export function TestMockup() {
  return (
    <MockChrome
      active="Test"
      subtitle="image-processing · resize-thumbnail"
      withSidebar={false}
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-(--mock-fg-4)" />
          <span className="text-[13px] font-medium tracking-tight">
            Enqueue a job
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Field label="Queue" value="image-processing" />
          <Field label="Job name" value="resize-thumbnail" />
          <Field label="Delay" value="0ms" />
        </div>

        <div className="mt-3 flex-1 border border-(--mock-line-2) bg-(--mock-bg-2)">
          <div className="flex items-center justify-between border-b border-(--mock-line-2) px-3 py-1.5 text-[10px] text-(--mock-fg-5)">
            <span className="uppercase tracking-[0.14em]">payload.json</span>
            <span className="font-mono text-[9px]">JSON · 4 lines</span>
          </div>
          <pre className="px-3 py-2 font-mono text-[11px] leading-relaxed text-(--mock-fg-2)">
            {`{
  "src": "s3://uploads/IMG_4827.heic",
  "sizes": [128, 512, 2048],
  "format": "webp"
}`}
          </pre>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-(--mock-fg-5)">
            <Layers className="h-3 w-3" />
            <span className="font-mono">1 of 1 worker connected</span>
          </div>
          <div className="flex items-center gap-2 border border-(--status-success-40) bg-(--status-success-10) px-3 py-1 text-[11px] text-(--status-success)">
            <Play className="h-3 w-3" fill="currentColor" />
            <span className="font-medium">Enqueue</span>
            <span className="font-mono text-[9px] text-(--status-success-70)">
              ⌘↵
            </span>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-(--mock-line-2) bg-(--mock-surface) px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-[0.14em] text-(--mock-fg-5)">
        {label}
      </div>
      <div className="mt-0.5 truncate font-mono text-[12px] text-(--mock-fg-1)">
        {value}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Errors panel — compact                                                     */
/* -------------------------------------------------------------------------- */

export function ErrorsMockup() {
  return (
    <div className="mockup-frame overflow-hidden rounded-xl border border-(--mock-line-1) bg-(--mock-bg) p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-(--status-failed)" />
          <span className="text-[13px] font-medium tracking-tight text-(--mock-fg-1)">
            Top errors · last 24h
          </span>
        </div>
        <span className="font-mono text-[10px] text-(--mock-fg-5)">
          287 events
        </span>
      </div>

      <div className="space-y-1.5">
        {[
          { name: "ECONNRESET", count: "184", trend: [4, 6, 8, 12, 9, 14, 22] },
          { name: "TimeoutError", count: "63", trend: [2, 3, 2, 4, 6, 5, 4] },
          {
            name: "ValidationError",
            count: "28",
            trend: [1, 0, 2, 1, 3, 2, 1],
          },
          { name: "S3AccessDenied", count: "12", trend: [0, 1, 0, 0, 2, 1, 0] },
        ].map((err) => (
          <div
            key={err.name}
            className="grid grid-cols-[1fr_60px_44px] items-center gap-3 border border-(--mock-line-2) bg-(--mock-surface) px-3 py-2"
          >
            <span className="truncate font-mono text-[11px] text-(--mock-fg-2)">
              {err.name}
            </span>
            <Sparkline values={err.trend} />
            <span className="text-right font-mono text-[11px] text-(--mock-fg-3)">
              {err.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 60;
  const h = 16;
  const step = w / (values.length - 1);
  const path = values
    .map((v, i) => {
      const x = (i * step).toFixed(2);
      const y = (h - (v / max) * h).toFixed(2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-4 w-15" aria-hidden>
      <path
        d={path}
        style={{ stroke: "var(--status-failed)" }}
        strokeWidth={1}
        fill="none"
      />
    </svg>
  );
}
