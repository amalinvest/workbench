import { motion } from "framer-motion";
import { AlertTriangle, Copy, RefreshCcw } from "lucide-react";
import * as React from "react";
import type { AppError } from "../lib/tauri";

interface ErrorPanelProps {
  error: AppError;
  onRetry: () => void;
  onEdit: () => void;
}

export function ErrorPanel({
  error,
  onRetry,
  onEdit,
}: ErrorPanelProps): JSX.Element {
  const ui = describe(error);
  const [copied, setCopied] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full items-center justify-center px-6"
    >
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <div className="text-sm font-medium">{ui.title}</div>
            {ui.body && (
              <p className="mt-1 text-sm text-muted-foreground">{ui.body}</p>
            )}
            {ui.hint && (
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background/50 p-2 font-mono text-xs">
                {ui.hint}
              </pre>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Edit connection
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(
                  `${error.code}\n${error.message}`,
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Copy className="size-3" />
              {copied ? "Copied" : "Copy logs"}
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              <RefreshCcw className="size-3" />
              Try again
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ErrorUi {
  title: string;
  body?: string;
  hint?: string;
}

function describe(err: AppError): ErrorUi {
  switch (err.code) {
    case "REDIS_AUTH":
      return {
        title: "Authentication required",
        body: "Redis rejected the credentials. Open Advanced and provide a username and password.",
      };
    case "REDIS_REFUSED":
      return {
        title: "Connection refused",
        body: "Nothing is listening on that address. Is Redis running?",
        hint: "docker run -p 6379:6379 redis:7",
      };
    case "REDIS_DNS":
      return {
        title: "Hostname not found",
        body: "DNS lookup failed for the host in the URL.",
      };
    case "REDIS_TLS":
      return {
        title: "TLS handshake failed",
        body: "Try a rediss:// URL if your Redis requires TLS.",
      };
    case "REDIS_TIMEOUT":
    case "TIMEOUT":
      return {
        title: "Timed out",
        body: "Redis did not respond within 5 seconds.",
      };
    case "REDIS_URL_INVALID":
      return {
        title: "Invalid Redis URL",
        body: err.message,
      };
    case "SIDECAR_NOT_FOUND":
      return {
        title: "Backend missing",
        body: "The bundled sidecar binary couldn't be located. Reinstall the app.",
      };
    case "SIDECAR_SPAWN_FAILED":
      return {
        title: "Backend failed to launch",
        body: err.message,
      };
    case "CRASH":
      return {
        title: "Backend crashed",
        body: err.message,
      };
    default:
      return {
        title: "Connection failed",
        body: err.message || "An unexpected error occurred.",
      };
  }
}
