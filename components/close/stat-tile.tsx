import { cn } from "cn";
import { Card } from "@/components/ui/card";
import { StatusDot, type StatusRole } from "@/components/close/status-chip";

/**
 * A handful of headline numbers is a KPI row of stat tiles, not a bar chart.
 *
 * The value uses the font's default proportional figures — `tabular-nums` is
 * reserved for columns that must align vertically, and makes a standalone
 * display number look loose.
 */
export function StatTile({
  label,
  value,
  note,
  status,
  className,
}: {
  /** Sentence case, no trailing colon. */
  label: string;
  value: string;
  note?: string;
  /** Optional state for the figure. Ships as an icon beside the note. */
  status?: { role: StatusRole; label: string };
  className?: string;
}) {
  return (
    <Card size="sm" className={cn("gap-1.5", className)}>
      <div className="px-(--card-spacing) text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className="px-(--card-spacing) text-lg leading-none font-semibold tracking-tight">
        {value}
      </div>
      {(note || status) && (
        <div className="flex items-center gap-1.5 px-(--card-spacing) text-xs text-muted-foreground">
          {status && <StatusDot role={status.role} label={status.label} />}
          <span className="truncate">{note ?? status?.label}</span>
        </div>
      )}
    </Card>
  );
}

export function StatTileRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
