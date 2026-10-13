import { cn } from "cn";
import { isBalanced } from "@/lib/format";

/**
 * A diverging bar: over and short are opposite poles around a neutral grey
 * midpoint, so the sign of a variance reads before the number does.
 *
 * The bar is always rendered beside its own value, so polarity never rests on
 * hue alone. `max` is the largest magnitude in the column, which keeps every
 * row on one shared scale.
 */
export function VarianceBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const span = Math.max(max, 0.01);
  const magnitude = Math.min(Math.abs(value) / span, 1);
  const flat = isBalanced(value);
  // Balanced rows still show a hairline stub at the midpoint so the column
  // reads as a scale rather than as gaps.
  const width = flat ? 0 : Math.max(magnitude * 50, 1.5);
  const positive = value > 0;

  return (
    <div
      aria-hidden
      className={cn("relative h-3.5 w-full min-w-24 overflow-hidden", className)}
    >
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-viz-mid" />
      {!flat && (
        <div
          className={cn(
            "absolute inset-y-0.5",
            positive
              ? "left-1/2 rounded-r-[4px] bg-viz-pos"
              : "right-1/2 rounded-l-[4px] bg-viz-neg",
          )}
          style={{ width: width + "%" }}
        />
      )}
    </div>
  );
}
