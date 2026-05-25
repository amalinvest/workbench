import { getVersion } from "@tauri-apps/api/app";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, RefreshCcw, X } from "lucide-react";
import * as React from "react";
import {
  getLastCheck,
  maybeCheckForUpdate,
  onLastCheckChange,
  type UpdateCheckSnapshot,
} from "../lib/updates";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Lightweight modal-less settings panel. The only persistent setting today is
 * the update channel state; we render it so dismissed update toasts aren't
 * lost forever. Slides in from the right rather than blocking the dashboard.
 */
export function Settings({ open, onClose }: SettingsProps): JSX.Element | null {
  const [snap, setSnap] = React.useState<UpdateCheckSnapshot | null>(
    getLastCheck,
  );
  const [version, setVersion] = React.useState<string>("");
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    void getVersion().then(setVersion);
    return onLastCheckChange((s) => setSnap(s));
  }, []);

  if (!open) return null;

  const onCheck = async (): Promise<void> => {
    setChecking(true);
    await maybeCheckForUpdate();
    setChecking(false);
  };

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-0 z-30 flex h-full w-80 flex-col border-l border-border bg-background shadow-2xl"
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-semibold">Settings</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <section className="space-y-3">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Updates
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Workbench checks for updates on launch and every hour. Installed
              version: <code className="font-mono">{version || "…"}</code>
            </p>
          </div>

          <div className="rounded-lg border border-border p-3 text-sm">
            {snap == null ? (
              <p className="text-muted-foreground">No checks yet.</p>
            ) : snap.available ? (
              <p>
                <span className="font-medium">Update available:</span>{" "}
                <code className="font-mono">{snap.available.version}</code>
                <br />
                <span className="text-xs text-muted-foreground">
                  Use the toast to install, or restart the app.
                </span>
              </p>
            ) : snap.ok ? (
              <p className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                You're up to date.
              </p>
            ) : (
              <p>
                <span className="font-medium text-red-500">
                  Last check failed
                </span>
                <br />
                <code className="mt-1 block max-w-full overflow-x-auto rounded bg-accent/40 p-1 font-mono text-xs">
                  {snap.error}
                </code>
              </p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {snap
                  ? `Checked ${formatRelative(snap.checkedAt)}`
                  : "Never checked"}
              </span>
              <button
                type="button"
                disabled={checking}
                onClick={() => void onCheck()}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 transition hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                <RefreshCcw
                  className={`size-3 ${checking ? "animate-spin" : ""}`}
                />
                Check now
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resources
          </h3>
          <a
            href="https://github.com/pontusab/workbench"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm transition hover:bg-accent"
          >
            GitHub
            <ExternalLink className="size-3 text-muted-foreground" />
          </a>
          <a
            href="https://getworkbench.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm transition hover:bg-accent"
          >
            Website
            <ExternalLink className="size-3 text-muted-foreground" />
          </a>
        </section>
      </div>
    </motion.aside>
  );
}

function formatRelative(ts: number): string {
  const ms = Date.now() - ts;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} h ago`;
  return `${Math.floor(sec / 86400)} d ago`;
}
