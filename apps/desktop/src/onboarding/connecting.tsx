import { motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";

type PillState = "pending" | "active" | "done" | "error";

interface ConnectingProps {
  pingState: PillState;
  connectState: PillState;
  openState: PillState;
  discoveryHint?: string;
}

export function Connecting({
  pingState,
  connectState,
  openState,
  discoveryHint,
}: ConnectingProps): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full max-w-md flex-col gap-2"
      >
        <h2 className="mb-1 text-base font-medium text-muted-foreground">
          Setting things up
        </h2>
        <Pill state={pingState} label="Reach Redis" />
        <Pill
          state={connectState}
          label="Discover queues"
          hint={discoveryHint}
        />
        <Pill state={openState} label="Open dashboard" />
      </motion.div>
    </div>
  );
}

interface PillProps {
  state: PillState;
  label: string;
  hint?: string;
}

function Pill({ state, label, hint }: PillProps): JSX.Element {
  return (
    <motion.div
      layout
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition ${pillStyles(state)}`}
    >
      <div className="flex items-center gap-3">
        <Indicator state={state} />
        <span className="font-medium">{label}</span>
      </div>
      {hint && state !== "pending" && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </motion.div>
  );
}

function Indicator({ state }: { state: PillState }): JSX.Element {
  if (state === "done") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-red-500/20 text-red-500">
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex size-5 items-center justify-center text-foreground">
        <Loader2 className="size-4 animate-spin" />
      </span>
    );
  }
  return (
    <span className="size-5 rounded-full border border-dashed border-border" />
  );
}

function pillStyles(state: PillState): string {
  switch (state) {
    case "done":
      return "border-emerald-500/30 bg-emerald-500/5 text-foreground";
    case "active":
      return "border-foreground/20 bg-foreground/5 text-foreground";
    case "error":
      return "border-red-500/40 bg-red-500/5 text-foreground";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}
