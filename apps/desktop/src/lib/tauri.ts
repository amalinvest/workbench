import { invoke } from "@tauri-apps/api/core";

/**
 * Typed wrappers around the Tauri commands exposed by
 * `apps/desktop/src-tauri/src/lib.rs`. Keeps the rest of the React tree
 * free of `invoke()` strings.
 */

export interface ConnectInput {
  redisUrl: string;
  prefix?: string;
  maxQueues?: number;
  username?: string;
  password?: string;
  /**
   * When true (default), persist the password to the OS keychain on a
   * successful connect. Set to false for "Connect once" semantics.
   */
  rememberPassword?: boolean;
}

export interface ConnectResult {
  port: number;
  queues: number;
  discoveryTotal: number | null;
  discoveryCapped: boolean;
  /**
   * Whether the password was persisted to the OS keychain on this connect.
   * - `null`  — user opted out of remember-password
   * - `true`  — saved successfully
   * - `false` — keychain unavailable / user denied (see `passwordSaveError`)
   */
  passwordSaved: boolean | null;
  passwordSaveError: string | null;
}

export interface ConnectionStatus {
  connected: boolean;
  port: number | null;
  queues: number | null;
}

export interface AppError {
  code: ErrorCode;
  message: string;
}

export type ErrorCode =
  | "REDIS_AUTH"
  | "REDIS_REFUSED"
  | "REDIS_DNS"
  | "REDIS_TLS"
  | "REDIS_TIMEOUT"
  | "REDIS_IO"
  | "REDIS_URL_INVALID"
  | "MISSING_REDIS_URL"
  | "SIDECAR_NOT_FOUND"
  | "SIDECAR_SPAWN_FAILED"
  | "TIMEOUT"
  | "CRASH"
  | "KEYCHAIN_MISS"
  | "KEYCHAIN_AMBIGUOUS"
  | "KEYCHAIN_PLATFORM"
  | "KEYCHAIN_LOCKED"
  | "KEYCHAIN_ENCODING"
  | "KEYCHAIN_TOO_LONG"
  | "KEYCHAIN_INVALID"
  | "KEYCHAIN_UNKNOWN"
  | "UNKNOWN";

export async function ping(redisUrl: string): Promise<void> {
  await invoke("ping", { redisUrl });
}

export async function connect(input: ConnectInput): Promise<ConnectResult> {
  return invoke<ConnectResult>("connect", {
    redisUrl: input.redisUrl,
    prefix: input.prefix ?? null,
    maxQueues: input.maxQueues ?? null,
    username: input.username ?? null,
    password: input.password ?? null,
    rememberPassword: input.rememberPassword ?? true,
  });
}

export async function disconnect(): Promise<void> {
  await invoke("disconnect");
}

export async function getStatus(): Promise<ConnectionStatus> {
  return invoke<ConnectionStatus>("get_status");
}

/**
 * Load the saved Redis password from the OS keychain. Returns `null` when
 * nothing is stored or the keychain is unavailable (e.g. headless Linux).
 */
export async function loadSavedPassword(): Promise<string | null> {
  try {
    const value = await invoke<string | null>("load_saved_password");
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export async function clearSavedPassword(): Promise<void> {
  try {
    await invoke("clear_saved_password");
  } catch {
    // Best-effort — keychain unavailability shouldn't block the UI flow.
  }
}
