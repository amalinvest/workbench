import type { Metadata } from "next";
import Link from "next/link";
import { BlogChrome } from "../../components/blog/blog-chrome";
import { POSTS } from "../../lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog — Workbench, the BullMQ dashboard",
  description:
    "Announcements, framework guides, and comparisons from the team building Workbench — the open-source BullMQ dashboard for modern Node apps.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Workbench Blog",
    description:
      "Announcements, framework guides, and comparisons from the team building Workbench.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <BlogChrome>
      <section className="px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Blog
          </h1>
          <p className="mt-3 text-[color:var(--color-muted-foreground)] md:text-lg">
            Releases, framework guides, and comparisons.
          </p>

          <ol className="mt-12 space-y-3">
            {POSTS.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/20 p-5 transition hover:border-[color:var(--color-foreground)]/30 md:flex-row md:items-center md:gap-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[color:var(--color-border)] bg-[color:var(--color-background)]">
                    {post.framework ? (
                      <post.framework.Logo className="h-6 w-6 text-[color:var(--color-foreground)]" />
                    ) : (
                      <span className="font-mono text-xs text-[color:var(--color-muted-foreground)]">
                        VS
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
                        {post.category}
                      </span>
                      <time
                        dateTime={post.publishedAt}
                        className="font-mono text-[10px] text-[color:var(--color-muted-foreground)]"
                      >
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </time>
                    </div>
                    <div className="mt-2 text-[17px] font-medium tracking-tight transition group-hover:text-[color:var(--color-foreground)] md:text-lg">
                      {post.heading}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
                      {post.lede}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </BlogChrome>
  );
}
