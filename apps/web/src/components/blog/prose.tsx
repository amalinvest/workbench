import type { ReactNode } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Optional filename to render as a tab above the code. */
  filename?: string;
}

/**
 * Minimal code block — monospace, dark surface, single-color text. We do
 * *not* run a syntax highlighter in this site for two reasons: it adds a
 * runtime JS payload that we don't otherwise need, and the snippets here
 * are short enough that the bracket / keyword colour-coding wouldn't
 * meaningfully improve readability.
 *
 * If we ever want highlighting, the right move is to pre-shiki this at
 * build time so the page stays a pure server component.
 */
export function CodeBlock({ code, language = "ts", filename }: CodeBlockProps) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-black/40">
      {filename && (
        <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] bg-[color:var(--color-muted)]/30 px-4 py-2 font-mono text-[11px] text-[color:var(--color-muted-foreground)]">
          <span>{filename}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.65] text-[color:var(--color-foreground)]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

interface ProseProps {
  children: ReactNode;
}

/**
 * Wrapper that gives the post body its typographic rhythm. We avoid the
 * `@tailwindcss/typography` plugin and hand-tune spacing here instead — the
 * blog ships only a dozen posts, so a one-page wrapper is cheaper than
 * dragging in another dependency and customising its defaults.
 */
export function Prose({ children }: ProseProps) {
  return (
    <div className="prose-body mx-auto max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-foreground)] md:text-base">
      {children}
    </div>
  );
}
