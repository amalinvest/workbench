import { COMPARISON_FAQ } from "./comparison";
import { FRAMEWORK_ORDER, FRAMEWORKS } from "./frameworks";
import {
  BullBoardComparisonBody,
  FrameworkAnnouncementBody,
} from "./templates";
import type { BlogPost } from "./types";

/**
 * All posts published on the blog. Ordering here determines the order on the
 * blog index page — keep the most recent first.
 *
 * Per-framework announcements share the same `publishedAt` because they
 * landed together with the multi-framework adapter rollout. If we add more
 * frameworks later, give each its own date.
 *
 * Slug naming convention: `bullmq-dashboard-for-<framework>`. This is the
 * exact phrase developers type into Google when they need this thing, which
 * is the entire SEO point of having one post per framework instead of a
 * single landing page that tries to do too much.
 */
const FRAMEWORK_ANNOUNCEMENT_DATE = "2026-05-26";

const frameworkPosts: BlogPost[] = FRAMEWORK_ORDER.map((key) => {
  const framework = FRAMEWORKS[key];
  if (!framework) {
    throw new Error(`Missing framework metadata for slug "${key}"`);
  }
  return {
    slug: `bullmq-dashboard-for-${framework.slug}`,
    title: `BullMQ dashboard for ${framework.name} — Workbench is now supported`,
    description: `Workbench, the open-source BullMQ dashboard, now ships a first-party adapter for ${framework.name}. Drop the dashboard into your existing ${framework.name} server with one command.`,
    keywords: [
      `bullmq dashboard ${framework.name.toLowerCase()}`,
      `bullmq ui ${framework.name.toLowerCase()}`,
      `${framework.name.toLowerCase()} queue dashboard`,
      `${framework.name.toLowerCase()} job queue ui`,
      `${framework.name.toLowerCase()} bullmq integration`,
      `bull-board ${framework.name.toLowerCase()} alternative`,
      "bullmq monitoring",
      "redis queue dashboard",
    ],
    category: "Announcement",
    publishedAt: FRAMEWORK_ANNOUNCEMENT_DATE,
    eyebrow: "Now supported",
    heading: `Workbench is now available for ${framework.name}`,
    lede: `A modern, open-source BullMQ dashboard for ${framework.name} — drop it into your existing server with one command, or run it as a native desktop app pointed at the same Redis.`,
    framework,
    body: () => <FrameworkAnnouncementBody framework={framework} />,
  };
});

const bullBoardPost: BlogPost = {
  slug: "workbench-vs-bull-board",
  title: "Workbench vs Bull Board — which BullMQ dashboard should you pick?",
  description:
    "An honest side-by-side of Workbench and Bull Board: framework coverage, FlowProducer DAGs, error triage, desktop app, install story, and when each one is the right call.",
  keywords: [
    "bull-board alternative",
    "bull board vs workbench",
    "bullmq dashboard comparison",
    "bullmq monitoring tool",
    "bullmq ui",
    "redis queue dashboard",
    "best bullmq dashboard",
    "bull-board next.js",
    "bull-board nestjs",
  ],
  category: "Comparison",
  publishedAt: FRAMEWORK_ANNOUNCEMENT_DATE,
  eyebrow: "Comparison",
  heading: "Workbench vs Bull Board",
  lede: "Bull Board has been the default BullMQ dashboard for years. Here's an honest, evidence-backed look at where Workbench fits, where Bull Board still wins, and how to migrate if you decide to switch.",
  faq: COMPARISON_FAQ,
  body: () => <BullBoardComparisonBody />,
};

export const POSTS: BlogPost[] = [bullBoardPost, ...frameworkPosts];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function listPostSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
