"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

type CopyCommandProps = {
  command: string;
  variant?: "button" | "inline";
};

export function CopyCommand({ command, variant = "button" }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onCopy}
        className="group inline-flex items-center gap-2 font-mono text-sm text-[color:var(--color-foreground)] underline decoration-[color:var(--color-border)] decoration-1 underline-offset-[6px] transition hover:decoration-[color:var(--color-foreground)]"
        aria-label={`Copy command: ${command}`}
      >
        <span>{command}</span>
        {copied ? (
          <CheckIcon className="h-3.5 w-3.5 text-emerald-400 opacity-100" />
        ) : (
          <CopyIcon className="h-3.5 w-3.5 text-[color:var(--color-muted-foreground)] opacity-0 transition group-hover:opacity-100" />
        )}
      </button>
    );
  }

  return (
    <div className="group flex w-full items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)]/40 px-5 py-3.5 font-mono text-sm shadow-sm transition hover:border-[color:var(--color-foreground)]/25">
      <span className="shrink-0 text-[color:var(--color-muted-foreground)]">
        $
      </span>
      <div className="scrollbar-code min-w-0 flex-1 overflow-x-auto">
        <span className="whitespace-pre">{command}</span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0"
        aria-label={`Copy command: ${command}`}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-emerald-400" />
        ) : (
          <CopyIcon className="h-4 w-4 text-[color:var(--color-muted-foreground)] transition group-hover:text-[color:var(--color-foreground)]" />
        )}
      </button>
    </div>
  );
}
