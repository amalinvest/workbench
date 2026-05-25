import type { AppError } from "./tauri";

/**
 * Top-level state machine for the desktop app. Drives which screen renders.
 *
 * Transitions (happy path):
 *   idle -> pinging -> connecting -> ready
 * Transitions (sad paths):
 *   pinging -> failed (ping returned error)
 *   connecting -> failed (sidecar handshake returned error)
 *   ready -> stale (sidecar crashed) -> connecting (reconnect)
 */
export type AppPhase =
  | { kind: "idle" }
  | { kind: "welcome" }
  | { kind: "connect" }
  | { kind: "pinging" }
  | { kind: "connecting"; pingDone: boolean }
  | {
      kind: "ready";
      port: number;
      queues: number;
      discoveryTotal: number | null;
      discoveryCapped: boolean;
    }
  | { kind: "stale" }
  | { kind: "failed"; stage: "ping" | "connect"; error: AppError };

export interface ConnectionForm {
  url: string;
  prefix: string;
  username: string;
  password: string;
  maxQueues: number;
  advancedOpen: boolean;
  /**
   * When true, the password is stored in the OS keychain after a successful
   * connect (and loaded back on next launch). When false, the password is
   * used for this session only and the keychain entry is cleared.
   */
  rememberPassword: boolean;
}

export const defaultForm: ConnectionForm = {
  // Pre-fill the URL from VITE_DEFAULT_REDIS_URL during development so
  // contributors don't retype it every time. In a production bundle this
  // env var is missing and the field falls back to the localhost default.
  url:
    (typeof import.meta !== "undefined" &&
      (
        import.meta as ImportMeta & {
          env?: { VITE_DEFAULT_REDIS_URL?: string };
        }
      ).env?.VITE_DEFAULT_REDIS_URL) ||
    "redis://localhost:6379",
  prefix: "bull",
  username: "",
  password: "",
  maxQueues: 100,
  advancedOpen: false,
  rememberPassword: true,
};
