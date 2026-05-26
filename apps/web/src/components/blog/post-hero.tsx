import Image from "next/image";
import type { LogoComponent } from "../../lib/blog/types";

interface PostHeroProps {
  eyebrow: string;
  heading: string;
  lede: string;
  publishedAt: string;
  /**
   * Framework descriptor for announcement posts. When set, the hero renders
   * a "Workbench × {framework.name}" lockup so the page acquires a strong,
   * SEO-friendly visual signature without us having to generate a per-post
   * hero PNG — the framework logo IS the design.
   */
  framework?: { name: string; Logo: LogoComponent };
}

/**
 * Standard top-of-post hero. The "lockup" pairs the Workbench mark with the
 * framework logo, separated by a small × glyph. Rendering it as real HTML
 * (rather than a baked image) means the headline is crawled as text, every
 * logo is a crisp SVG at any DPI, and we get free dark/light theming.
 */
export function PostHero({
  eyebrow,
  heading,
  lede,
  publishedAt,
  framework,
}: PostHeroProps) {
  const date = new Date(publishedAt);
  return (
    <header className="mb-12 flex flex-col items-center text-center md:mb-16">
      {framework && (
        <div className="mb-8 flex items-center justify-center gap-5 md:gap-7">
          <LogoTile>
            <Image
              src="/app-icon.svg"
              alt="Workbench"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
          </LogoTile>
          <span
            aria-hidden
            className="font-mono text-2xl text-[color:var(--color-muted-foreground)]/60 md:text-3xl"
          >
            ×
          </span>
          <LogoTile>
            <framework.Logo className="h-10 w-10 text-[color:var(--color-foreground)]" />
          </LogoTile>
        </div>
      )}

      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-muted-foreground)]">
        {eyebrow}
      </div>

      <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        {heading}
      </h1>

      <p className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-[color:var(--color-muted-foreground)] md:text-lg">
        {lede}
      </p>

      <time
        dateTime={publishedAt}
        className="mt-6 font-mono text-[11px] text-[color:var(--color-muted-foreground)]"
      >
        {date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
    </header>
  );
}

/**
 * Soft tile that wraps each logo in the lockup so the two icons feel like a
 * matched pair rather than two random SVGs floating next to each other.
 */
function LogoTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/40 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_24px_-12px_rgba(0,0,0,0.4)] md:h-20 md:w-20">
      {children}
    </div>
  );
}
