import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { QueueInfo } from "@/core/types";

export interface AttentionAlert {
  id: string;
  variant: "destructive" | "warning" | "default";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Present when the alert can be dismissed. A dismissal only holds while the
   * fingerprint stays the same, so the alert resurfaces when the underlying
   * state changes (e.g. the failed count moves).
   */
  dismissFingerprint?: string;
}

interface AttentionAlertsProps {
  queues: QueueInfo[];
  onQueueSelect: (queue: string) => void;
  onViewFailed: (queue: string) => void;
}

export function buildAttentionAlerts(
  queues: QueueInfo[],
  onQueueSelect: (queue: string) => void,
  onViewFailed: (queue: string) => void,
): AttentionAlert[] {
  const alerts: AttentionAlert[] = [];

  for (const queue of queues) {
    const backlog =
      queue.counts.waiting +
      queue.counts.prioritized +
      queue.counts["waiting-children"];

    if (
      queue.workerCount === 0 &&
      backlog > 0 &&
      queue.workerCount !== null &&
      queue.workerCount !== undefined
    ) {
      alerts.push({
        id: `workers-${queue.name}`,
        variant: "destructive",
        title: `${queue.name}: no workers connected`,
        description: `${backlog.toLocaleString()} jobs waiting with zero workers processing this queue.`,
        actionLabel: "Open queue",
        onAction: () => onQueueSelect(queue.name),
      });
    }

    if (queue.isPaused) {
      alerts.push({
        id: `paused-${queue.name}`,
        variant: "warning",
        title: `${queue.name} is paused`,
        description:
          "New jobs will not be processed until the queue is resumed.",
        actionLabel: "Open queue",
        onAction: () => onQueueSelect(queue.name),
        dismissFingerprint: "paused",
      });
    }

    if (queue.counts.failed > 0) {
      alerts.push({
        id: `failed-${queue.name}`,
        variant: "warning",
        title: `${queue.counts.failed.toLocaleString()} failed jobs in ${queue.name}`,
        description: "Review failures and retry or remove stale jobs.",
        actionLabel: "View failed",
        onAction: () => onViewFailed(queue.name),
        dismissFingerprint: String(queue.counts.failed),
      });
    }
  }

  return alerts;
}

const DISMISSED_ALERTS_KEY = "workbench:dismissed-alerts";

function readDismissedAlerts(): Record<string, string> {
  try {
    const raw = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => typeof v === "string"),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeDismissedAlerts(dismissed: Record<string, string>) {
  try {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(dismissed));
  } catch {
    // Storage unavailable (private browsing, quota) — dismissals just won't persist.
  }
}

function useDismissedAlerts() {
  const [dismissed, setDismissed] =
    React.useState<Record<string, string>>(readDismissedAlerts);

  const dismiss = React.useCallback((id: string, fingerprint: string) => {
    setDismissed((prev) => {
      const next = { ...prev, [id]: fingerprint };
      writeDismissedAlerts(next);
      return next;
    });
  }, []);

  const restoreAll = React.useCallback(() => {
    setDismissed(() => {
      writeDismissedAlerts({});
      return {};
    });
  }, []);

  return { dismissed, dismiss, restoreAll };
}

function AlertItem({
  alert,
  onDismiss,
}: {
  alert: AttentionAlert;
  onDismiss?: () => void;
}) {
  const Icon =
    alert.variant === "destructive"
      ? AlertCircle
      : alert.variant === "warning"
        ? AlertTriangle
        : CheckCircle2;

  return (
    <Alert
      variant={alert.variant}
      className="px-3 py-2.5 [&>svg]:left-3 [&>svg]:top-3 [&>svg~*]:pl-6"
    >
      <Icon className="size-3.5" />
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-0.5">
          <AlertTitle className="mb-0 text-sm font-medium leading-snug">
            {alert.title}
          </AlertTitle>
          <AlertDescription className="text-[11px] leading-relaxed">
            {alert.description}
          </AlertDescription>
        </div>
        <div className="flex shrink-0 items-center gap-1 self-start sm:self-center">
          {alert.actionLabel && alert.onAction && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 px-2.5 text-xs"
              onClick={alert.onAction}
            >
              {alert.actionLabel}
            </Button>
          )}
          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 shrink-0 p-0 text-muted-foreground"
              aria-label={`Dismiss alert: ${alert.title}`}
              title="Dismiss (kept until this alert changes)"
              onClick={onDismiss}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

export function AttentionAlerts({
  queues,
  onQueueSelect,
  onViewFailed,
}: AttentionAlertsProps) {
  const { dismissed, dismiss, restoreAll } = useDismissedAlerts();
  const alerts = buildAttentionAlerts(queues, onQueueSelect, onViewFailed);

  const active = alerts.filter(
    (alert) =>
      alert.dismissFingerprint === undefined ||
      dismissed[alert.id] !== alert.dismissFingerprint,
  );
  const dismissedCount = alerts.length - active.length;

  const restoreLine =
    dismissedCount > 0 ? (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>
          {dismissedCount} dismissed alert{dismissedCount === 1 ? "" : "s"}
        </span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-[11px]"
          onClick={restoreAll}
        >
          Restore
        </Button>
      </div>
    ) : null;

  if (alerts.length === 0 || active.length === 0) {
    return (
      <div className="space-y-3">
        <Alert
          variant="default"
          className="px-3 py-2.5 [&>svg]:left-3 [&>svg]:top-3 [&>svg~*]:pl-6"
        >
          <CheckCircle2 className="size-3.5" />
          <div className="min-w-0 space-y-0.5">
            <AlertTitle className="mb-0 text-sm font-medium leading-snug">
              {alerts.length === 0 ? "No issues detected" : "No active alerts"}
            </AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed">
              {alerts.length === 0
                ? "All queues look healthy. Metrics refresh every few seconds while the dashboard is open."
                : "Remaining alerts were dismissed. They resurface automatically when their queue state changes."}
            </AlertDescription>
          </div>
        </Alert>
        {restoreLine}
      </div>
    );
  }

  const visible = active.slice(0, 3);
  const hidden = active.slice(3);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Needs attention
      </h3>
      {visible.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onDismiss={
            alert.dismissFingerprint !== undefined
              ? () => dismiss(alert.id, alert.dismissFingerprint as string)
              : undefined
          }
        />
      ))}
      {hidden.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-muted-foreground"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Show {hidden.length} more
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {hidden.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDismiss={
                  alert.dismissFingerprint !== undefined
                    ? () =>
                        dismiss(alert.id, alert.dismissFingerprint as string)
                    : undefined
                }
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
      {restoreLine}
    </div>
  );
}
