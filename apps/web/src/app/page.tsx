import {
  ActivityIcon,
  CalendarClockIcon,
  GithubIcon,
  PackageIcon,
  SearchIcon,
  WorkflowIcon,
} from "lucide-react";
import { CopyCommand } from "../components/copy-command";

const GITHUB_URL = "https://github.com/pontusab/workbench";
const NPM_URL = "https://www.npmjs.com/package/@getworkbench/hono";

const features = [
  {
    icon: WorkflowIcon,
    title: "Flows & DAG view",
    body: "Inspect BullMQ flows as an interactive graph. Jump between parent and child jobs.",
  },
  {
    icon: ActivityIcon,
    title: "Metrics",
    body: "24-hour throughput, error rates, slowest jobs and top failing types.",
  },
  {
    icon: CalendarClockIcon,
    title: "Schedulers",
    body: "Repeatable and delayed jobs in one place, with next-run times.",
  },
  {
    icon: SearchIcon,
    title: "Search",
    body: "field:value syntax across job data. Filter by tags you configure.",
  },
];

export default function Page() {
  return (
    <main className="min-h-dvh">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-foreground)]" />
          <span>Workbench</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-[color:var(--color-muted-foreground)]">
          <a
            href={NPM_URL}
            className="inline-flex items-center gap-2 transition hover:text-[color:var(--color-foreground)]"
            target="_blank"
            rel="noreferrer"
          >
            <PackageIcon className="h-4 w-4" />
            npm
          </a>
          <a
            href={GITHUB_URL}
            className="inline-flex items-center gap-2 transition hover:text-[color:var(--color-foreground)]"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </nav>

      <section className="mx-auto mt-8 w-full max-w-4xl px-6 text-center md:mt-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs text-[color:var(--color-muted-foreground)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          MIT licensed · v0.1
        </div>
        <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
          Open-source dashboard for BullMQ.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-[color:var(--color-muted-foreground)] md:text-xl">
          A modern job queue dashboard that drops into any Node backend. Flows,
          metrics, schedulers and search — served behind your own auth.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <CopyCommand command="npx @getworkbench/cli init" />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[color:var(--color-muted-foreground)] transition hover:text-[color:var(--color-foreground)]"
          >
            View source on GitHub →
          </a>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-6 md:mt-28">
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)] shadow-[0_0_80px_-20px_rgba(255,255,255,0.15)]">
          <div className="aspect-[16/10] w-full">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-[#111] to-[#090909] text-[color:var(--color-muted-foreground)]">
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest">
                  UI preview
                </div>
                <div className="mt-2 text-sm">
                  Drop a screenshot or &lt;video&gt; at{" "}
                  <code className="rounded bg-black/40 px-1.5 py-0.5 text-xs">
                    apps/web/public/hero.png
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-6 md:mt-28">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[color:var(--color-border)] p-5"
            >
              <f.icon className="h-5 w-5" />
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-3xl px-6 md:mt-28">
        <div className="rounded-2xl border border-[color:var(--color-border)] p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            One command to set it up
          </h2>
          <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
            Detects your Hono app, installs the adapter, injects the mount, and
            writes a sensible <code>.env.example</code>.
          </p>
          <div className="mt-6 flex justify-center">
            <CopyCommand command="npx @getworkbench/cli init" />
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-24 w-full max-w-6xl px-6 py-10 text-sm text-[color:var(--color-muted-foreground)]">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-[color:var(--color-border)] pt-8 md:flex-row md:items-center">
          <div>MIT — built by Midday</div>
          <div className="flex items-center gap-5">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[color:var(--color-foreground)]"
            >
              GitHub
            </a>
            <a
              href={NPM_URL}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[color:var(--color-foreground)]"
            >
              npm
            </a>
            <a
              href="https://github.com/pontusab/workbench/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[color:var(--color-foreground)]"
            >
              License
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
