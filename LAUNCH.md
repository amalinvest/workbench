# Launch notes

Internal launch checklist + ready-to-post copy. Delete after launch.

## Pre-launch checklist

- [ ] `getworkbench.dev` domain registered and DNS pointed at Vercel
- [ ] `@getworkbench` npm scope created (`npm org create getworkbench`)
- [ ] `@getworkbench/core`, `@getworkbench/hono`, `@getworkbench/cli` published at `0.1.0` (see [RELEASING.md](./RELEASING.md))
- [ ] `apps/web` deployed to Vercel on production domain
- [ ] Hero screenshot / 30s demo video dropped at `apps/web/public/hero.png` and `apps/web/public/hero.mp4`
- [ ] OG image at `apps/web/public/og.png` (1200×630) wired into `metadata.openGraph.images` and `metadata.twitter.images`
- [ ] README hero screenshot / GIF added at top of `README.md`
- [ ] X / Bluesky handle @getworkbench claimed
- [ ] GitHub repo made public, topics added (`bullmq`, `dashboard`, `nodejs`, `hono`, `typescript`)
- [ ] GitHub Discussions enabled (Settings → Features → Discussions)
- [ ] `midday/apps/worker` migrated (see [MIGRATION.md](./MIGRATION.md)) — used as the real-world reference deployment
- [ ] `@getworkbench/cli init` smoke-tested end-to-end in a fresh Hono repo

## Show HN post

```
Show HN: Workbench – open-source BullMQ dashboard (drop-in for any Node backend)

Hey HN — I built Workbench, a modern dashboard for BullMQ that mounts as a route in your existing Node backend instead of running as a separate service.

• One command: `npx @getworkbench/cli init`
• Flows & DAG view, 24h metrics, schedulers, search with field:value syntax
• Basic-auth protected by default
• MIT

It's been running in production inside Midday (https://midday.ai) for months. Today I split it out as standalone OSS.

Looking for feedback on the adapter API, the search syntax, and what queue backends to add next (bolero for Redis Streams? BullMQ Pro?).

https://getworkbench.dev
https://github.com/pontusab/workbench
```

## X / Bluesky (one post)

```
Workbench — open-source BullMQ dashboard, drop-in for any Node backend.

One command to set up:
  npx @getworkbench/cli init

Flows, metrics, schedulers, search. MIT.

https://getworkbench.dev
```

## Reddit /r/node

```
Title: I open-sourced a modern BullMQ dashboard — drops into your Hono app with one command

Body:
Hey /r/node — for the last year or so I've been running a custom BullMQ dashboard at Midday. Today I split it out as a standalone OSS project called Workbench.

What makes it different from existing options:
- Mounts as a route in your existing Node backend. No separate service.
- Flows (DAG view), 24h metrics, schedulers, powerful search (`field:value` syntax across job.data)
- Modern UI (shadcn, dark mode)
- `npx @getworkbench/cli init` — detects your Hono app, installs the adapter, injects the mount
- MIT, Hono adapter today; Express, Fastify, Next.js and Hyper next

Would love feedback on the adapter API and what to prioritize for 0.2.

https://getworkbench.dev
https://github.com/pontusab/workbench
```

## Blog post draft

Title: "Why we split Workbench out of Midday as OSS"

Bullets:
- Trigger.dev-style UI for jobs, but for plain BullMQ
- Zero infrastructure — mounts inside your existing backend
- Why CLI-first (copying a 10-line snippet is error-prone; we wanted the frictionless `create-next-app` moment)
- Flows & schedulers & search in one place
- Where we're going (Express/Fastify/Next.js/Hyper adapters, alerts, SSE live updates)

Link at the end to getworkbench.dev and the Show HN thread.
