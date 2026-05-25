import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { dismissToast, pushToast } from "./toasts";

/**
 * Last update check result, exposed via `getLastCheck()` for a settings
 * panel. Resets on every call to `maybeCheckForUpdate`.
 */
export interface UpdateCheckSnapshot {
  checkedAt: number;
  ok: boolean;
  error?: string;
  available?: { version: string };
}

let lastCheck: UpdateCheckSnapshot | null = null;
const listeners = new Set<(snap: UpdateCheckSnapshot | null) => void>();

export function getLastCheck(): UpdateCheckSnapshot | null {
  return lastCheck;
}

export function onLastCheckChange(
  cb: (snap: UpdateCheckSnapshot | null) => void,
): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setSnapshot(snap: UpdateCheckSnapshot | null): void {
  lastCheck = snap;
  for (const fn of listeners) fn(snap);
}

let timer: ReturnType<typeof setInterval> | null = null;

/**
 * Schedule a non-blocking update check on app boot + every hour after.
 * Returns the cleanup function. Safe to call multiple times — only the
 * latest schedule wins.
 */
export function scheduleUpdateChecks(): () => void {
  if (timer) clearInterval(timer);
  // Run the first check after the UI mounts (microtask), then hourly.
  void maybeCheckForUpdate();
  timer = setInterval(
    () => {
      void maybeCheckForUpdate();
    },
    60 * 60 * 1000,
  );
  return () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
}

export async function maybeCheckForUpdate(): Promise<void> {
  try {
    const update = await check();
    if (!update) {
      setSnapshot({ checkedAt: Date.now(), ok: true });
      return;
    }
    setSnapshot({
      checkedAt: Date.now(),
      ok: true,
      available: { version: update.version },
    });
    pushUpdateToast(update);
  } catch (e) {
    setSnapshot({
      checkedAt: Date.now(),
      ok: false,
      error: (e as { message?: string })?.message ?? String(e),
    });
  }
}

function pushUpdateToast(update: Update): void {
  const id = `update-${update.version}`;
  pushToast({
    id,
    title: `Workbench ${update.version} available`,
    description: "Restart to install the latest version.",
    variant: "info",
    dismissible: true,
    action: {
      label: "Install & restart",
      onClick: async () => {
        try {
          await update.downloadAndInstall();
          await relaunch();
        } catch (e) {
          dismissToast(id);
          pushToast({
            id: `${id}-error`,
            title: "Update failed",
            description: (e as { message?: string })?.message ?? String(e),
            variant: "error",
            dismissible: true,
          });
        }
      },
    },
  });
}
