/**
 * Q&A for the @getworkbench/mcp launch post.
 *
 * Same dual-surfacing rules as `COMPARISON_FAQ`: the entries are rendered
 * verbatim as a visible Q&A block at the bottom of the post body *and* as
 * `FAQPage` JSON-LD attached to the post page. Both halves are required —
 * Google's spam policy forbids FAQ schema without the same content
 * rendered on the page, and Perplexity / ChatGPT / Claude lift verbatim
 * answers from the JSON-LD when they cite the page.
 *
 * Answers are written as self-contained 40–80-word statements so they can
 * be quoted as a featured-snippet block without surrounding context. Lead
 * with the literal question phrasing developers actually type into Google
 * or paste into an AI chat ("how do I use bullmq from cursor", "does the
 * workbench mcp need redis", etc.) — the close-match between the question
 * and the answer is what wins the citation.
 */
export const MCP_FAQ: Array<{ question: string; answer: string }> = [
  {
    question: "What is the Workbench MCP server?",
    answer:
      "@getworkbench/mcp is an open-source Model Context Protocol server that lets AI agents — Cursor, Claude Desktop, Zed, Continue.dev, and any other MCP client — inspect, debug, and operate BullMQ queues through a running Workbench dashboard. It ships 18 tools split between read-only inspection and gated destructive operations, runs locally over stdio, and reuses the dashboard's existing Basic Auth and readonly flag instead of introducing a new permission model.",
  },
  {
    question: "Which AI editors and agents does it work with?",
    answer:
      "Any MCP-aware client. The package is verified against Cursor, Claude Desktop, Zed, and Continue.dev, and works the same way with VS Code's Copilot agent, Goose, and other MCP runtimes because the server speaks the standard JSON-RPC over stdio protocol. Install instructions for each editor live in the package README at github.com/pontusab/workbench/tree/main/packages/mcp.",
  },
  {
    question: "Does the Workbench MCP need its own Redis connection?",
    answer:
      "No. The MCP is a thin HTTP proxy in front of a running Workbench dashboard — it never talks to Redis directly. You configure it with a single WORKBENCH_URL pointing at your dashboard (and optionally the same Basic Auth credentials the dashboard already uses). All BullMQ work happens server-side inside the dashboard, so there's no second connection pool to manage and no second source of truth for queue config.",
  },
  {
    question: "Does the MCP respect the dashboard's readonly mode?",
    answer:
      "Yes, end-to-end. When the dashboard is started with readonly: true it rejects every write operation with a 403, and the MCP surfaces that 403 to the calling agent as an actionable error message explaining that the dashboard is in readonly mode. The agent can still call every inspect tool — list queues, inspect jobs, read metrics — but cannot retry, remove, pause, enqueue, or trigger schedulers until readonly is disabled.",
  },
  {
    question: "What tools does the Workbench MCP expose?",
    answer:
      "18 tools across two intents. Inspect (readOnlyHint): workbench_get_overview, list_queues, get_quick_counts, get_metrics, get_activity, list_jobs, list_runs, get_job, search_jobs, list_schedulers, list_flows, get_flow, list_tag_values. Operate (destructiveHint): workbench_retry_job, remove_job, promote_job, pause_queue, resume_queue, run_scheduler_now, enqueue_job, clean_jobs, bulk_retry, bulk_delete. Clients use the annotations to auto-approve reads and prompt before writes.",
  },
  {
    question: "How do I install the Workbench MCP in Cursor?",
    answer:
      'Add an entry under "mcpServers" in ~/.cursor/mcp.json: { "workbench": { "command": "npx", "args": ["-y", "@getworkbench/mcp"], "env": { "WORKBENCH_URL": "http://localhost:3000/jobs", "WORKBENCH_USERNAME": "admin", "WORKBENCH_PASSWORD": "hunter2" } } }. Restart Cursor and the 18 workbench_* tools appear in the chat. The same pattern works for Claude Desktop, Zed, and Continue.dev with their respective config files — see the package README for the exact paths.',
  },
  {
    question: "Is the Workbench MCP free and open source?",
    answer:
      "Yes. @getworkbench/mcp is MIT-licensed, ships on npm, and the source lives at github.com/pontusab/workbench/tree/main/packages/mcp. There is no paid tier, no telemetry, and no account required — same as the rest of the Workbench project.",
  },
];
