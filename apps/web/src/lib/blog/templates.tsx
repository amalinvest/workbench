import Link from "next/link";
import { CompareTable } from "../../components/blog/compare-table";
import { CodeBlock, Prose } from "../../components/blog/prose";
import { CopyCommand } from "../../components/copy-command";
import { BULL_BOARD_HEADLINES, COMPARISON_ROWS } from "./comparison";
import type { FrameworkMeta } from "./types";

/**
 * Reusable body template for the per-framework announcement posts.
 *
 * Every framework post follows the same structure: short intro, install
 * command, mount-it code sample, "what you get" bullet list, "why not Bull
 * Board" callout with a compact comparison table, and a call-to-action.
 *
 * Sharing the template means a copy edit propagates to all 11 posts at once,
 * and individual posts can't drift apart. The only per-framework variation
 * lives in `framework.flavor`, `framework.codeSample`, and a couple of small
 * one-liners — everything else comes from `comparison.ts`.
 */
export function FrameworkAnnouncementBody({
  framework,
}: {
  framework: FrameworkMeta;
}) {
  const cmd = `npx @getworkbench/cli init`;
  const adapterUrl = `https://www.npmjs.com/package/@getworkbench/${framework.slug}`;
  const exampleUrl = `https://github.com/pontusab/workbench/tree/main/examples/with-${framework.slug}`;
  const readmeUrl = `https://github.com/pontusab/workbench/tree/main/packages/${framework.slug}#readme`;

  return (
    <Prose>
      <p>
        Workbench now ships a first-party adapter for{" "}
        <a
          href={framework.homepage}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          {framework.name}
        </a>{" "}
        — {framework.flavor}. Drop the same open-source BullMQ dashboard you
        already get on the desktop straight into your existing {framework.name}{" "}
        server, behind whatever auth and routing you already run.
      </p>

      <p>
        No new processes to manage, no parallel Redis connections, no copy of
        your queue config drifting out of sync. The dashboard reads from the
        same Redis your workers do, mounts at a path of your choice, and gets
        out of the way the rest of the time.
      </p>

      <SectionHeading>Install in your {framework.name} app</SectionHeading>

      <p>
        Run the CLI from your project root — it detects {framework.name},
        installs <Code>@getworkbench/{framework.slug}</Code>, and wires the
        mount into <Code>{framework.mountSurface}</Code> for you:
      </p>

      <div className="not-prose my-6">
        <CopyCommand command={cmd} variant="button" />
      </div>

      <p>
        Prefer to wire it up by hand? Install the adapter and add the snippet
        below to the file you already use for your {framework.name} server
        bootstrap:
      </p>

      <CodeBlock code={framework.codeSample} language="ts" />

      <p>
        That&apos;s the whole integration. Visit{" "}
        <Code>http://localhost:3000/jobs</Code> and the dashboard renders with
        every queue you passed in. The adapter is published as{" "}
        <a
          href={adapterUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          <Code>@getworkbench/{framework.slug}</Code>
        </a>{" "}
        and the runnable example lives at{" "}
        <a
          href={exampleUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          examples/with-{framework.slug}
        </a>{" "}
        in the repo.
      </p>

      <SectionHeading>What you get</SectionHeading>

      <ul className="not-prose my-6 space-y-2 pl-0">
        {[
          "Live counters, p50/p95 latency, and throughput sparklines per queue.",
          "Virtualised runs table with status filters, full payloads one click away, and keyboard-driven retry.",
          "FlowProducer DAG view for parent/child jobs, with per-node duration and status.",
          "Scheduler timeline for cron + delayed jobs — pause, resume, edit cron without a redeploy.",
          "Error triage grouped by exception class with 24h trend lines.",
          "Click any line in a failed job's stack trace to jump straight to Cursor or VS Code.",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-foreground)]/60" />
            <span className="text-[15px] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <SectionHeading>Why not bull-board for {framework.name}?</SectionHeading>

      <p>
        Bull Board is the dashboard most {framework.name} teams reach for first,
        and for plenty of projects it&apos;s fine. The three places Workbench
        tends to win are coverage, polish, and operations — here are the
        high-order bits:
      </p>

      <ul className="not-prose my-6 space-y-4">
        {BULL_BOARD_HEADLINES.slice(0, 3).map(({ title, body }) => (
          <li
            key={title}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/20 p-5"
          >
            <div className="text-[15px] font-medium tracking-tight">
              {title}
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-muted-foreground)]">
              {body}
            </p>
          </li>
        ))}
      </ul>

      <p>
        The short version for {framework.name} users specifically: Bull Board
        does not ship an official {framework.name} adapter, so you&apos;d be on
        a community wrapper or bridging through Express. Workbench&apos;s{" "}
        <Code>@getworkbench/{framework.slug}</Code> is a first-party package
        with a smoke-tested example app and the same one-command installer as
        every other supported framework.
      </p>

      <div className="not-prose my-8">
        <CompareTable rows={COMPARISON_ROWS} compact />
      </div>

      <p>
        For the full side-by-side, see{" "}
        <Link
          href="/blog/workbench-vs-bull-board"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          Workbench vs Bull Board
        </Link>
        .
      </p>

      <SectionHeading>Get started</SectionHeading>

      <p>
        Adapter docs and a complete runnable example live in the{" "}
        <a
          href={readmeUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          @getworkbench/{framework.slug} README
        </a>
        . If anything trips up, open an issue on{" "}
        <a
          href="https://github.com/pontusab/workbench"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          GitHub
        </a>{" "}
        — every supported framework has a CI smoke test, so reproductions move
        fast.
      </p>

      <div className="not-prose mt-10 flex flex-col items-start gap-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/30 p-6 md:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
          Install
        </div>
        <div className="text-xl font-semibold tracking-tight md:text-2xl">
          Workbench for {framework.name}, one command.
        </div>
        <CopyCommand command={cmd} variant="button" />
      </div>
    </Prose>
  );
}

/**
 * Body for the dedicated "Workbench vs Bull Board" comparison post. Pulls
 * from the same `COMPARISON_ROWS` array so every other place that surfaces
 * a comparison stays in lockstep with this page.
 */
export function BullBoardComparisonBody() {
  const cmd = `npx @getworkbench/cli init`;

  return (
    <Prose>
      <p>
        If you&apos;re running BullMQ in production and you&apos;ve typed
        &quot;bullmq dashboard&quot; into Google in the last two years, the
        first thing you found was{" "}
        <a
          href="https://github.com/felixmosh/bull-board"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] hover:decoration-[color:var(--color-foreground)]"
        >
          Bull Board
        </a>
        . It&apos;s a great open-source project and the default choice for a lot
        of teams. This post is for the moment you outgrow it — or start from
        scratch and want to know what else is out there.
      </p>

      <p>
        We&apos;ll keep this honest. Bull Board is genuinely useful and the
        comparison below only highlights places Workbench solves a specific
        problem better. If your needs are exclusively in Bull Board&apos;s sweet
        spot — basic per-queue inspection inside an Express or Fastify app —
        there&apos;s nothing wrong with sticking with it.
      </p>

      <SectionHeading>The short version</SectionHeading>

      <ul className="not-prose my-6 space-y-4">
        {BULL_BOARD_HEADLINES.map(({ title, body }) => (
          <li
            key={title}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/20 p-5"
          >
            <div className="text-[15px] font-medium tracking-tight">
              {title}
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-muted-foreground)]">
              {body}
            </p>
          </li>
        ))}
      </ul>

      <SectionHeading>Side-by-side</SectionHeading>

      <p>
        Every row below maps to behaviour you can verify against the public
        codebases. &quot;Limited&quot; means the capability exists in some form
        (plugin, manual config, third-party wrapper) but isn&apos;t a
        first-class feature.
      </p>

      <div className="not-prose my-8">
        <CompareTable rows={COMPARISON_ROWS} />
      </div>

      <SectionHeading>When Bull Board is the right call</SectionHeading>

      <p>
        Bull Board still wins for a handful of cases — being honest about that
        is what makes the rest of this comparison useful.
      </p>

      <ul className="not-prose my-6 space-y-2 pl-0">
        {[
          "Your app already runs Express or Fastify and you only need read-only queue inspection.",
          "You can't add a new dependency vendor and need a project with a long, well-known maintainer history.",
          "You already wrote tooling on top of Bull Board's API and a migration cost outweighs the upside.",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-foreground)]/60" />
            <span className="text-[15px] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <SectionHeading>When Workbench is the right call</SectionHeading>

      <ul className="not-prose my-6 space-y-2 pl-0">
        {[
          "You're on a framework Bull Board doesn't ship a first-party adapter for — Hono, Elysia, NestJS, Next.js, Astro, Nuxt, Bun, or h3.",
          "You want a local-first inspector you can run on your laptop without touching the server — point it at any Redis URL, get the dashboard.",
          "Your team triages production failures regularly and you want grouped errors, trend lines, and stack traces that open in your editor.",
          "You use FlowProducer and need a real DAG, not a flat list.",
          "You want one install command for every framework instead of a different setup per project.",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-foreground)]/60" />
            <span className="text-[15px] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <SectionHeading>Migrating from Bull Board</SectionHeading>

      <p>
        The two dashboards mount the same way — a single line in your server
        bootstrap. Migration is normally a five-minute job:
      </p>

      <ol className="not-prose my-6 list-decimal space-y-2 pl-6">
        {[
          "Remove @bull-board/* packages and the mount call.",
          "Run npx @getworkbench/cli init — it detects your framework and adds the right adapter.",
          "Pass the same Queue instances you were passing to Bull Board.",
          "If you were using basic auth in front of Bull Board, the CLI offers to wire the same thing for Workbench.",
        ].map((item) => (
          <li key={item} className="text-[15px] leading-relaxed">
            {item}
          </li>
        ))}
      </ol>

      <div className="not-prose mt-10 flex flex-col items-start gap-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/30 p-6 md:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
          Try Workbench
        </div>
        <div className="text-xl font-semibold tracking-tight md:text-2xl">
          One command, eleven frameworks.
        </div>
        <CopyCommand command={cmd} variant="button" />
      </div>
    </Prose>
  );
}

/* -------------------------------------------------------------------------- */
/* Internal building blocks                                                   */
/* -------------------------------------------------------------------------- */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-4 text-2xl font-semibold tracking-tight md:text-[26px]">
      {children}
    </h2>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[color:var(--color-muted)] px-1.5 py-0.5 font-mono text-[0.875em] text-[color:var(--color-foreground)]">
      {children}
    </code>
  );
}
