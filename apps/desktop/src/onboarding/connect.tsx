import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, ClipboardPaste } from "lucide-react";
import * as React from "react";
import type { ConnectionForm } from "../lib/state";

interface ConnectProps {
  form: ConnectionForm;
  onChange: (form: ConnectionForm) => void;
  onSubmit: () => void;
  hasError?: { code: string; message: string } | null;
}

export function Connect({
  form,
  onChange,
  onSubmit,
  hasError,
}: ConnectProps): JSX.Element {
  const urlRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    urlRef.current?.focus();
    urlRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit();
  };

  const handlePaste = async (): Promise<void> => {
    try {
      const text = await tryReadClipboard();
      if (text) onChange({ ...form, url: text.trim() });
    } catch {
      // Clipboard plugin not loaded; ignore. The OS paste shortcut still works.
    }
  };

  const showAuthHint = hasError?.code === "REDIS_AUTH";

  return (
    <div className="flex h-full items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-5"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Connect to Redis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Workbench discovers BullMQ queues on the connection automatically.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Redis URL</span>
          <div className="relative">
            <input
              ref={urlRef}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={form.url}
              onChange={(e) => onChange({ ...form, url: e.target.value })}
              placeholder="redis://localhost:6379"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 font-mono text-sm shadow-sm transition focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Paste from clipboard"
              tabIndex={-1}
            >
              <ClipboardPaste className="size-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            TLS via <code className="font-mono">rediss://</code>. Use the
            Advanced fields below for separate username / password.
          </p>
        </label>

        <details
          open={form.advancedOpen || showAuthHint}
          onToggle={(e) =>
            onChange({ ...form, advancedOpen: e.currentTarget.open })
          }
          className="group rounded-lg border border-border"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-sm font-medium">
            Advanced
            <ChevronDown className="size-4 transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-3 border-t border-border p-3">
            <Field
              label="Key prefix"
              value={form.prefix}
              onChange={(v) => onChange({ ...form, prefix: v })}
              placeholder="bull"
              mono
            />
            <Field
              label="Username (Redis 6+ ACL)"
              value={form.username}
              onChange={(v) => onChange({ ...form, username: v })}
              placeholder="default"
              mono
              focusOnMount={showAuthHint}
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => onChange({ ...form, password: v })}
              placeholder={form.password ? "" : "Stored in the system keychain"}
            />
            <label className="-mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-3.5 rounded border-border text-foreground focus:ring-foreground/30"
                checked={form.rememberPassword}
                onChange={(e) =>
                  onChange({ ...form, rememberPassword: e.target.checked })
                }
              />
              Remember password in the system keychain
            </label>
            <Field
              label="Max queues"
              type="number"
              value={String(form.maxQueues)}
              onChange={(v) =>
                onChange({ ...form, maxQueues: Number.parseInt(v, 10) || 100 })
              }
            />
          </div>
        </details>

        <button
          type="submit"
          disabled={!form.url.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Connect
          <ArrowRight className="size-4" />
        </button>
      </motion.form>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "password" | "number";
  mono?: boolean;
  /**
   * Focus the field once on mount. We use a ref+effect instead of `autoFocus`
   * so the focus only fires when this prop is explicitly true (e.g. after
   * surfacing an auth error pill that revealed the field).
   */
  focusOnMount?: boolean;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
  focusOnMount,
}: FieldProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm shadow-sm transition focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

async function tryReadClipboard(): Promise<string | null> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      return await navigator.clipboard.readText();
    }
    return null;
  } catch {
    return null;
  }
}
