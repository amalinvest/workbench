import type { MetadataRoute } from "next";
import { POSTS } from "../lib/blog/posts";

const SITE = "https://getworkbench.dev";

/**
 * Sitemap is what tells Google "here are all the URLs worth indexing on
 * this site, with their last-modified dates and priorities". Without it
 * the blog posts would get crawled eventually but at a much slower cadence.
 *
 * Priorities are tuned so:
 *   - The home page is the top entry point.
 *   - The blog index sits right below it.
 *   - The bull-board comparison post is the highest-intent blog page (people
 *     actively searching for an alternative are closer to converting), so it
 *     gets a higher priority than the per-framework announcements.
 *   - Per-framework posts share a slightly lower priority since they're
 *     numerous and partly overlapping in keywords.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blog: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: post.category === "Comparison" ? 0.8 : 0.7,
  }));

  return [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blog,
  ];
}
