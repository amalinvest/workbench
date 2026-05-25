import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import appIcon from "../../icon.svg";

interface WelcomeProps {
  onContinue: () => void;
}

export function Welcome({ onContinue }: WelcomeProps): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-w-lg flex-col items-center gap-6"
      >
        <Logo />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Workbench for BullMQ
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A local-first dashboard for your queues. Connect a Redis instance
            and inspect runs, schedulers, and flows.
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Get started
          <ArrowRight className="size-4" />
        </button>
        <p className="text-xs text-muted-foreground">
          MIT licensed · No telemetry · Your data stays on your machine.
        </p>
      </motion.div>
    </div>
  );
}

function Logo(): JSX.Element {
  // The SVG is a full-canvas (1024×1024) macOS-style icon with built-in
  // padding around the rounded square. h-20 w-20 renders the rounded square
  // at ~64px visually, matching the previous placeholder logo weight.
  return (
    <img
      src={appIcon}
      alt="Workbench"
      width={80}
      height={80}
      className="h-20 w-20 select-none"
      draggable={false}
    />
  );
}
