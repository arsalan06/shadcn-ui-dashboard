import {
  CircleCheckIcon,
  CircleDashedIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

/**
 * The four status roles are fixed and never themed — the same hexes serve light
 * and dark. Each one always ships as icon + label so a status is never carried
 * by colour alone (two of the four are deliberately sub-3:1 on a light surface).
 * The label itself wears normal ink; the icon carries the hue.
 */
export type StatusRole = "good" | "warning" | "serious" | "critical" | "neutral";

const ROLE: Record<StatusRole, { icon: LucideIcon; tint: string; ink: string }> =
  {
    good: {
      icon: CircleCheckIcon,
      tint: "bg-status-good/10",
      ink: "text-status-good",
    },
    warning: {
      icon: TriangleAlertIcon,
      tint: "bg-status-warning/15",
      ink: "text-status-warning",
    },
    serious: {
      icon: TriangleAlertIcon,
      tint: "bg-status-serious/15",
      ink: "text-status-serious",
    },
    critical: {
      icon: OctagonAlertIcon,
      tint: "bg-status-critical/10",
      ink: "text-status-critical",
    },
    neutral: {
      icon: CircleDashedIcon,
      tint: "bg-muted",
      ink: "text-muted-foreground",
    },
  };

export function StatusChip({
  role,
  children,
  className,
  inverse = false,
}: {
  role: StatusRole;
  children: React.ReactNode;
  className?: string;
  /**
   * Pins the pill to a fixed light surface instead of the theme's tint, so the
   * status hue keeps its contrast when placed on a colored field (the sidebar's
   * brand red, say) rather than the neutral card background it's tuned for —
   * a role's own ink can otherwise land in the same hue family as the surface
   * behind it (critical red on the red sidebar) and lose its identity.
   */
  inverse?: boolean;
}) {
  const { icon: Icon, tint, ink } = ROLE[role];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        inverse ? "bg-white text-black/80" : cn(tint, "text-foreground"),
        className,
      )}
    >
      <Icon aria-hidden className={cn("size-3.5 shrink-0", ink)} />
      {children}
    </span>
  );
}

/** Bare icon for dense table cells, where the label lives in the column head. */
export function StatusDot({
  role,
  label,
  className,
}: {
  role: StatusRole;
  label: string;
  className?: string;
}) {
  const { icon: Icon, ink } = ROLE[role];
  return (
    <Icon
      role="img"
      aria-label={label}
      className={cn("size-4 shrink-0", ink, className)}
    />
  );
}
