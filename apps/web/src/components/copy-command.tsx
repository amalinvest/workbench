"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
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

  return (
    <button
      type="button"
      onClick={onCopy}
      className="group inline-flex items-center gap-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-muted)] px-5 py-3 font-mono text-sm transition hover:border-[color:var(--color-foreground)]/40"
      aria-label={`Copy command: ${command}`}
    >
      <span className="text-[color:var(--color-muted-foreground)]">$</span>
      <span>{command}</span>
      {copied ? (
        <CheckIcon className="h-4 w-4 text-emerald-400" />
      ) : (
        <CopyIcon className="h-4 w-4 text-[color:var(--color-muted-foreground)] transition group-hover:text-[color:var(--color-foreground)]" />
      )}
    </button>
  );
}
