import Link from "next/link";
import { FRAMEWORK_ORDER, FRAMEWORKS } from "@/lib/blog/frameworks";

export function FrameworkGrid() {
  return (
    <div className="not-prose my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FRAMEWORK_ORDER.map((slug) => {
        const fw = FRAMEWORKS[slug];
        const Logo = fw.Logo;
        return (
          <Link
            key={slug}
            href={`/docs/frameworks/${slug}`}
            data-card
            className="group flex items-center gap-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/30 px-4 py-3 transition hover:border-[color:var(--color-brand)]/40 hover:bg-[color:var(--color-muted)]/60"
          >
            <Logo className="h-5 w-5 shrink-0 opacity-80 transition group-hover:opacity-100" />
            <span className="font-medium">{fw.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
