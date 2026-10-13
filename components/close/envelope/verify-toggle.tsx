"use client";

import { StatusChip } from "@/components/close/status-chip";

/**
 * Verification is a two-state toggle rather than a checkbox: the chip states
 * what it means ("Verified" / "Pending") instead of leaving a tick to be read.
 */
export function VerifyToggle({
  verified,
  onToggle,
  disabled,
  label,
}: {
  verified: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={verified}
      aria-label={
        (verified ? "Mark pending: " : "Mark verified: ") + label
      }
      className="rounded-full transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
    >
      <StatusChip role={verified ? "good" : "warning"}>
        {verified ? "Verified" : "Pending"}
      </StatusChip>
    </button>
  );
}
