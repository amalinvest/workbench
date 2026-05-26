import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogChrome } from "../../../components/blog/blog-chrome";
import { PostHero } from "../../../components/blog/post-hero";
import { getPost, listPostSlugs } from "../../../lib/blog/posts";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render every blog post at build time. The post set is static and
 * known at compile time, so this turns each post into a fully cacheable HTML
 * file — same performance characteristics as a SSG marketing page, no runtime
 * server cost, no client JS for the article body.
 */
export function generateStaticParams() {
  return listPostSlugs().map((slug) => ({ slug }));
}

/**
 * Per-post metadata for SEO and link unfurls. Each post gets its own canonical
 * URL, keyword list, OG image (rendered dynamically by the sibling
 * `opengraph-image.tsx`), and Article-type Open Graph data. This is what gets
 * indexed by search engines and surfaced when someone shares a link.
 */
export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Workbench"],
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  /**
   * JSON-LD Article schema. Google uses this to enrich the search snippet
   * with a publish date and headline; LLM-based search (Perplexity, Bing
   * Copilot, ChatGPT browsing) reads it preferentially over the rendered
   * page. Stringifying it via `dangerouslySetInnerHTML` is the canonical
   * way to embed JSON-LD in a Next.js page — it dodges React's HTML escaping
   * which would otherwise mangle the JSON.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.heading,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "Workbench" },
    publisher: {
      "@type": "Organization",
      name: "Workbench",
      logo: {
        "@type": "ImageObject",
        url: "https://getworkbench.dev/app-icon.png",
      },
    },
    mainEntityOfPage: `https://getworkbench.dev/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

  return (
    <BlogChrome>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is intentionally inline and trusted.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="px-6 pt-12 pb-20 md:px-10 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-3xl">
          <PostHero
            eyebrow={post.eyebrow}
            heading={post.heading}
            lede={post.lede}
            publishedAt={post.publishedAt}
            framework={post.framework}
          />
          {post.body()}
        </div>
      </article>
    </BlogChrome>
  );
}
