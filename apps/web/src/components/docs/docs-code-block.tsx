"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

interface DocsCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

const LANG_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript",
  js: "JavaScript",
  jsx: "JavaScript",
  bash: "Shell",
  sh: "Shell",
  json: "JSON",
  text: "Code",
};

/**
 * Docs code block — dark surface, language label, copy button.
 * Matches the marketing site's terminal aesthetic.
 */
export function DocsCodeBlock({
  code,
  language = "text",
  filename,
}: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const label =
    filename ?? LANG_LABELS[language] ?? language.toUpperCase();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="docs-code-block not-prose my-6 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--docs-code-bg)] shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-border)]/80 bg-[color:var(--docs-code-header)] px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-muted-foreground)]">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-[color:var(--color-muted-foreground)] transition hover:bg-[color:var(--color-muted)]/50 hover:text-[color:var(--color-foreground)]"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="h-3 w-3 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="scrollbar-code overflow-x-auto px-4 py-4 font-mono text-[13px] leading-[1.7] text-[color:var(--docs-code-fg)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
