import { LazyStore } from "@tauri-apps/plugin-store";

/**
 * Persisted connection profile. Stored at `$APPDATA/workbench/connections.json`
 * via `tauri-plugin-store`. **Non-secret fields only** — the password lives
 * in the OS keychain (Keychain on macOS, Credential Manager on Windows,
 * Secret Service on Linux), wired through `secrets.rs` on the Rust side.
 */
export interface SavedConnection {
  url: string;
  prefix?: string;
  username?: string;
  maxQueues?: number;
  lastConnectedAt: number;
}

const store = new LazyStore("connections.json", {
  defaults: {},
  autoSave: true,
});

const LAST_KEY = "last";

export async function loadLastConnection(): Promise<SavedConnection | null> {
  const raw = await store.get<SavedConnection>(LAST_KEY);
  return raw ?? null;
}

export async function saveLastConnection(conn: SavedConnection): Promise<void> {
  await store.set(LAST_KEY, conn);
}

export async function clearLastConnection(): Promise<void> {
  await store.delete(LAST_KEY);
}
