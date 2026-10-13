"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { cn } from "cn";
import { STEPS, type StepKey } from "@/components/close/close-provider";

export function StepNav({ current }: { current: StepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Envelope steps" className="overflow-x-auto mt-5">
      <ol className="flex min-w-max items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const last = i === STEPS.length - 1;
          return (
            <li
              key={step.key}
              className={cn("flex items-start", !last && "flex-1")}
            >
              <Link
                href={step.href}
                aria-current={active ? "step" : undefined}
                className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    done && "border-status-good bg-status-good text-white",
                    active &&
                      "border-primary bg-primary text-primary-foreground",
                    !done && !active && "bg-card text-muted-foreground",
                  )}
                >
                  {done ? <CheckIcon className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "line-clamp-2 text-[11px] font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </Link>

              {!last && (
                <div
                  className={cn(
                    "mt-3.5 h-px min-w-6 flex-1 transition-colors",
                    done ? "bg-status-good" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
