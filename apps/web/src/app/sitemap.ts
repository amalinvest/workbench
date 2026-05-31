import type { MetadataRoute } from "next";
import { POSTS } from "../lib/blog/posts";
import { source } from "../lib/docs/source";

const SITE = "https://getworkbench.dev";

/**
 * Sitemap is what tells Google "here are all the URLs worth indexing on
 * this site, with their last-modified dates and priorities".
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const blog: MetadataRoute.Sitemap = POSTS.map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: post.category === "Comparison" ? 0.8 : 0.7,
  }));

  const docsPages = source.getPages();
  const docs: MetadataRoute.Sitemap = docsPages.map((page) => ({
    url: `${SITE}${page.url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: page.url === "/docs" ? 0.9 : 0.85,
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
    ...docs,
    ...blog,
  ];
}
