/**
 * Source of truth for the "Workbench vs bull-board" comparison surfaced on
 * the homepage, in every framework announcement, and as a standalone post.
 *
 * Keep it factual. Bull Board is a fine project and the alternative everyone
 * already knows about — the comparison earns trust only if every row is
 * defensible. When in doubt, link to evidence rather than making a stronger
 * claim than the codebase actually supports.
 *
 * Status legend:
 *   "yes"     — supported out of the box
 *   "partial" — possible but requires extra work / community plugin
 *   "no"      — not supported
 *   string    — qualitative answer (e.g. version compatibility)
 */
export type ComparisonStatus = "yes" | "partial" | "no";

export interface ComparisonRow {
  feature: string;
  /** One-sentence amplification shown under the row title on mobile. */
  note?: string;
  workbench: ComparisonStatus | string;
  bullBoard: ComparisonStatus | string;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Native desktop app",
    note: "Local-first inspector you launch from Spotlight, no server changes.",
    workbench: "yes",
    bullBoard: "no",
  },
  {
    feature: "Drop-in dashboard for your server",
    note: "Mount the same UI inside your existing Node app.",
    workbench: "yes",
    bullBoard: "yes",
  },
  {
    feature: "Officially supported frameworks",
    workbench:
      "Hono, Elysia, Express, Fastify, NestJS, Next.js, Koa, Astro, Nuxt, Bun, h3",
    bullBoard: "Express, Fastify, Hapi, Koa (community Next.js wrappers)",
  },
  {
    feature: "One-command install",
    note: "Auto-detects your framework and injects the mount for you.",
    workbench: "npx @getworkbench/cli init",
    bullBoard: "no",
  },
  {
    feature: "FlowProducer DAG visualisation",
    note: "Parent / child flows rendered as a real graph, not a flat list.",
    workbench: "yes",
    bullBoard: "partial",
  },
  {
    feature: "Live counters + p50 / p95 latency",
    note: "Per-queue throughput sparklines, updated as workers move jobs.",
    workbench: "yes",
    bullBoard: "partial",
  },
  {
    feature: "Error triage grouped by class",
    note: "Failures clustered with 24h trend lines so you spot regressions fast.",
    workbench: "yes",
    bullBoard: "no",
  },
  {
    feature: "Enqueue jobs from the UI",
    note: "Schema-aware payload editor, ⌘↵ to dispatch.",
    workbench: "yes",
    bullBoard: "partial",
  },
  {
    feature: "Open failed jobs in your editor",
    note: "Click a stack-trace line, jump to Cursor / VS Code.",
    workbench: "yes",
    bullBoard: "no",
  },
  {
    feature: "Keyboard-driven UI",
    note: "⌘K palette, single-key actions, no menu hunting.",
    workbench: "yes",
    bullBoard: "no",
  },
  {
    feature: "Light + dark themes",
    workbench: "yes",
    bullBoard: "yes",
  },
  {
    feature: "BullMQ Pro support",
    workbench: "yes",
    bullBoard: "yes",
  },
  {
    feature: "Open source, MIT-licensed",
    workbench: "yes",
    bullBoard: "yes",
  },
];

/**
 * The "headline" trade-offs we surface in every framework announcement, in
 * one place so each post stays consistent and updates with the codebase.
 */
export const BULL_BOARD_HEADLINES = [
  {
    title: "A native desktop app, not just an embeddable UI",
    body: "Bull Board is a server-side dashboard you mount into your app. Workbench is both — embed it into your server (same one-liner) or run the native macOS app pointed at your Redis URL with zero server changes.",
  },
  {
    title: "Wider framework coverage, with first-party adapters",
    body: "Bull Board ships adapters for Express, Fastify, Hapi, and Koa. Workbench adds Hono, Elysia, NestJS, Next.js, Astro, Nuxt, Bun.serve, and h3 — eleven officially-supported integrations, each with a smoke-tested example app.",
  },
  {
    title: "Built for production triage, not just queue inspection",
    body: "Error grouping with 24h trend lines, FlowProducer DAGs, scheduler timelines, p50/p95 latency, and ⌘-click to jump from a failed job's stack trace into Cursor or VS Code. The UI is keyboard-driven end-to-end.",
  },
  {
    title: "One command to wire it up",
    body: "`npx @getworkbench/cli init` detects your framework, installs the right adapter, and injects the mount — including the basic-auth boilerplate. Same install regardless of whether you're on Express or Nuxt.",
  },
];
