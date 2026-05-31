import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

export const GITHUB_URL = "https://github.com/pontusab/workbench";
export const SPONSORS_URL = "https://github.com/sponsors/pontusab";

interface SiteChromeProps {
  children: ReactNode;
  /** Optional breadcrumb suffix after "workbench /" */
  section?: "blog" | "docs";
  /** Highlight the active nav link */
  active?: "product" | "docs" | "blog";
}

const navLink =
  "hidden transition hover:text-[color:var(--color-foreground)] md:inline";
const navActive = "text-[color:var(--color-foreground)]";

/**
 * Shared header + footer for marketing, blog, and docs pages.
 */
export function SiteChrome({
  children,
  section,
  active = "product",
}: SiteChromeProps) {
  return (
    <main className="relative isolate min-h-screen">
      <nav
        className="site-chrome-nav sticky top-0 z-50 flex items-center justify-between border-b border-[color:var(--color-border)]/60 bg-[color:var(--color-background)]/70 px-6 py-3 backdrop-blur-md md:px-10"
        style={{ ["--site-chrome-nav-height" as string]: "3.3125rem" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/app-icon.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="font-mono text-sm lowercase tracking-tight">
            workbench
          </span>
          {section && (
            <span className="font-mono text-sm text-[color:var(--color-muted-foreground)]">
              / {section}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-5 text-sm text-[color:var(--color-muted-foreground)] md:gap-6">
          <Link
            href="/"
            className={`${navLink} ${active === "product" ? navActive : ""}`}
          >
            Product
          </Link>
          <Link
            href="/docs"
            className={`${navLink} ${active === "docs" ? navActive : ""}`}
          >
            Docs
          </Link>
          <Link
            href="/blog"
            className={`${navLink} ${active === "blog" ? navActive : ""}`}
          >
            Blog
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={navLink}
          >
            GitHub
          </a>
          <a
            href={SPONSORS_URL}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[color:var(--color-foreground)]"
          >
            Sponsor
          </a>
          <ThemeToggle />
        </div>
      </nav>

      {children}

      <footer className="border-t border-[color:var(--color-border)]/60 px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between text-xs text-[color:var(--color-muted-foreground)]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition hover:text-[color:var(--color-foreground)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Workbench</span>
          </Link>
          <span className="font-mono lowercase">workbench · mit licensed</span>
        </div>
      </footer>
    </main>
  );
}
