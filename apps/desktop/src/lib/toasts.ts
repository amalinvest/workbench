import { useSyncExternalStore } from "react";

/**
 * Tiny external-store toast queue. Lives outside React so the updater can
 * push toasts from non-component contexts (timers, event listeners).
 */
export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "info" | "warning" | "error" | "success";
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
}

const listeners = new Set<() => void>();
let toasts: Toast[] = [];

function emit(): void {
  for (const fn of listeners) fn();
}

export function pushToast(t: Toast): void {
  // Replace any prior toast with the same id so repeated emits don't pile up.
  toasts = [...toasts.filter((x) => x.id !== t.id), t];
  emit();
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts(): readonly Toast[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => toasts,
  );
}
