import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogChrome } from "../../../components/blog/blog-chrome";
import { PostHero } from "../../../components/blog/post-hero";
import { getPost, listPostSlugs } from "../../../lib/blog/posts";

const SITE_URL = "https://getworkbench.dev";

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
    authors: [{ name: "Pontus Abrahamsson", url: "https://x.com/pontusab" }],
    creator: "Pontus Abrahamsson",
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: ["https://x.com/pontusab"],
      tags: post.keywords,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: "@pontusab",
    },
  };
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImageUrl = `${postUrl}/opengraph-image`;
  const articleType = post.category === "Comparison" ? "Article" : "TechArticle";

  /**
   * JSON-LD graph for the post.
   *
   * Three connected nodes:
   *   - `Article` / `TechArticle` — the canonical schema Google enriches with
   *     publish date, headline, and (with `image`) the OG card in the search
   *     snippet. LLM-based search (Perplexity, ChatGPT browsing, Bing
   *     Copilot, Claude) reads it preferentially over the rendered page
   *     and uses `dateModified` for freshness weighting.
   *   - `BreadcrumbList` — gives Google AI Overviews and ChatGPT a clean
   *     entity path (`Home → Blog → Post`), which both engines use to
   *     describe where a citation comes from. Without it the breadcrumb is
   *     reconstructed from URL parsing, which is lossy.
   *   - `FAQPage` (optional) — only emitted when `post.faq` is set. Perplexity
   *     in particular favours pages with FAQ structured data; the same Q&A
   *     must also be visible on the page (Google spam policy), which the
   *     post body is responsible for rendering.
   *
   * `@id`-references the site-wide Organization + WebSite nodes defined in
   * the root layout so the brand definition is never duplicated, and the
   * named author (Pontus) is attributed as a `Person` rather than the
   * organisation — LLMs cite named authors more readily, and a named
   * `Person` with credentials (sameAs links to GitHub + X) is a stronger
   * E-E-A-T signal than an Organization byline.
   *
   * Stringifying via `dangerouslySetInnerHTML` is the canonical way to
   * embed JSON-LD in a Next.js page — it dodges React's HTML escaping
   * which would otherwise mangle the JSON.
   */
  const graph: Array<Record<string, unknown>> = [
    {
      "@type": articleType,
      "@id": `${postUrl}#article`,
      headline: post.heading,
      name: post.title,
      description: post.description,
      url: postUrl,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      inLanguage: "en-US",
      isAccessibleForFree: true,
      articleSection: post.category,
      keywords: post.keywords,
      image: [
        {
          "@type": "ImageObject",
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      author: {
        "@type": "Person",
        name: "Pontus Abrahamsson",
        url: "https://x.com/pontusab",
        sameAs: [
          "https://x.com/pontusab",
          "https://github.com/pontusab",
        ],
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: { "@id": postUrl },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#workbench` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${postUrl}#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.heading,
          item: postUrl,
        },
      ],
    },
  ];

  if (post.faq && post.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${postUrl}#faq`,
      mainEntity: post.faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <BlogChrome>
      <script
        type="application/ld+json"
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
