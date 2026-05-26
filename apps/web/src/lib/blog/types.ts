import type { ComponentType, ReactNode, SVGProps } from "react";

export type LogoComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Per-framework descriptor used both in the marquee and in the blog templates.
 * The blog templates generate a hero "Workbench × {framework}" lockup from this
 * data, plus a copy-able install command and a working code sample.
 *
 * `flavor` is a single-sentence framing line we drop into the post intro to
 * give each announcement its own voice instead of feeling like 11 copies of
 * the same template. Keep it short — one clause — and present-tense.
 *
 * `codeSample` is the source we render in the "Wire it up" code block. Prefer
 * a sample that matches the production `examples/with-*` setup so readers can
 * cross-reference if they want to dig deeper.
 */
export interface FrameworkMeta {
  /** npm-package slug, e.g. `hono` for `@getworkbench/hono`. */
  slug: string;
  /** Display name, e.g. "Next.js". */
  name: string;
  /** Framework homepage. Used for an outbound link in the post intro. */
  homepage: string;
  /** Marketing-grade single-line framing for the post intro. */
  flavor: string;
  /** Mount-point hint shown in copy. e.g. "Bun.serve fetch handler". */
  mountSurface: string;
  /** A working snippet that mounts Workbench at `/jobs`. */
  codeSample: string;
  /** Logo component. */
  Logo: LogoComponent;
}

export type PostCategory = "Announcement" | "Comparison" | "Guide";

export interface BlogPost {
  slug: string;
  /** Page <title>. Optimise for SEO; lead with the keyword. */
  title: string;
  /** Page meta description. ~150 chars. */
  description: string;
  /** Free-form keywords forwarded as <meta name="keywords">. */
  keywords: string[];
  category: PostCategory;
  /** ISO date string. */
  publishedAt: string;
  /** Short eyebrow shown above the H1 (e.g. "Now supported"). */
  eyebrow: string;
  /** H1 shown in the post hero. */
  heading: string;
  /** One-paragraph lede shown directly below the H1. */
  lede: string;
  /**
   * Optional framework descriptor. When set, the hero renders a
   * "Workbench × {framework.name}" lockup and the post is tagged as a
   * per-framework announcement.
   */
  framework?: FrameworkMeta;
  /**
   * Body renderer. Returns JSX rather than markdown so we don't take a hard
   * dependency on MDX for this small library of posts. Each post owns its own
   * structure; the templates in `templates.tsx` keep most posts on rails.
   */
  body: () => ReactNode;
}
