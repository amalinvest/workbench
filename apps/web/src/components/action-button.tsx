"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type Variant = "primary" | "secondary";

interface ActionButtonProps {
  href: string;
  label: string;
  /**
   * Pre-rendered icon node. Passed as JSX (`<Download ... />`) so the page
   * can stay a Server Component — function components can't cross the
   * server/client boundary as props, but plain JSX elements can.
   */
  icon: ReactNode;
  /** Single-character keyboard shortcut hint (no modifiers, e.g. `D` / `C`). */
  shortcut?: string;
  variant?: Variant;
  external?: boolean;
}

/**
 * Pill-shaped CTA — icon on the left, label in the middle, optional
 * keyboard-shortcut chip on the right. The shortcut also binds a global
 * keydown listener so pressing the key navigates to `href`.
 *
 * Primary variant is the saturated blue with a soft inner highlight on the
 * top edge; secondary is a muted graphite chip with a hairline border.
 */
export function ActionButton({
  href,
  label,
  icon,
  shortcut,
  variant = "primary",
  external,
}: ActionButtonProps) {
  useEffect(() => {
    if (!shortcut) return;
    const key = shortcut.toLowerCase();
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (event.key.toLowerCase() !== key) return;
      event.preventDefault();
      if (external) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = href;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, href, external]);

  const isPrimary = variant === "primary";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={
        isPrimary
          ? "action-btn action-btn-primary group"
          : "action-btn action-btn-secondary group"
      }
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="text-[15px] font-medium tracking-tight">{label}</span>
      {shortcut && (
        <span
          aria-hidden
          className={
            isPrimary ? "action-btn-chip-primary" : "action-btn-chip-secondary"
          }
        >
          {shortcut.toUpperCase()}
        </span>
      )}
    </a>
  );
}
