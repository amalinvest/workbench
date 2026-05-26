import { Check, Minus, X } from "lucide-react";
import type { ComparisonStatus } from "../../lib/blog/comparison";

interface CompareTableProps {
  rows: {
    feature: string;
    note?: string;
    workbench: ComparisonStatus | string;
    bullBoard: ComparisonStatus | string;
  }[];
  /**
   * Compact rendering for embedded comparisons in framework posts (hides the
   * row notes, drops the table to 6 rows). The full table on the dedicated
   * comparison post leaves this off.
   */
  compact?: boolean;
}

/**
 * Side-by-side comparison table used on the bull-board comparison post and
 * inlined (compact mode) at the bottom of every framework announcement. The
 * status renderer maps the three sentinel values to icons; anything else is
 * rendered as plain text so we can use the same component for qualitative
 * answers like "Hono, Elysia, …".
 */
export function CompareTable({ rows, compact = false }: CompareTableProps) {
  const displayRows = compact ? rows.slice(0, 6) : rows;

  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[color:var(--color-muted)]/50 text-[color:var(--color-muted-foreground)]">
            <th className="border-b border-[color:var(--color-border)] px-4 py-3 font-medium">
              Feature
            </th>
            <th className="border-b border-[color:var(--color-border)] px-4 py-3 font-medium text-[color:var(--color-foreground)]">
              Workbench
            </th>
            <th className="border-b border-[color:var(--color-border)] px-4 py-3 font-medium">
              Bull Board
            </th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => (
            <tr
              key={row.feature}
              className="border-t border-[color:var(--color-border)]/60 align-top"
            >
              <td className="px-4 py-3">
                <div className="font-medium tracking-tight">{row.feature}</div>
                {!compact && row.note && (
                  <div className="mt-1 text-[12px] leading-relaxed text-[color:var(--color-muted-foreground)]">
                    {row.note}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <Status value={row.workbench} positive />
              </td>
              <td className="px-4 py-3">
                <Status value={row.bullBoard} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Status({
  value,
  positive,
}: {
  value: ComparisonStatus | string;
  positive?: boolean;
}) {
  if (value === "yes") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[13px] ${
          positive ? "text-emerald-500" : "text-[color:var(--color-foreground)]"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>Yes</span>
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-muted-foreground)]">
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>Limited</span>
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--color-muted-foreground)]/80">
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span>No</span>
      </span>
    );
  }
  return (
    <span className="text-[13px] leading-relaxed text-[color:var(--color-foreground)]">
      {value}
    </span>
  );
}
