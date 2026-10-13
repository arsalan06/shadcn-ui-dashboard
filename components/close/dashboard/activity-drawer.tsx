"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  HistoryIcon,
  MessageSquareIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useClose } from "@/components/close/close-provider";
import type { ActivityEntry, ActivityKind } from "@/lib/close-data";
import { cn } from "cn";

type Filter = "All" | ActivityKind;

const FILTERS: Filter[] = ["All", "Checkout", "Reopen", "Comment"];

/**
 * Each kind reads as a sentence about a person, so the verb lives with the
 * icon rather than in a column. The icon carries the hue and the sentence
 * carries the meaning, so the entry never depends on colour alone.
 */
const KIND: Record<
  ActivityKind,
  { icon: LucideIcon; verb: string; tint: string; ink: string }
> = {
  Checkout: {
    icon: CircleCheckIcon,
    verb: "checked out the white envelope for",
    tint: "bg-status-good/10",
    ink: "text-status-good",
  },
  Reopen: {
    icon: RotateCcwIcon,
    verb: "reopened the white envelope for",
    tint: "bg-status-warning/15",
    ink: "text-status-warning",
  },
  Comment: {
    icon: MessageSquareIcon,
    verb: "left a comment on the envelope for",
    tint: "bg-muted",
    ink: "text-muted-foreground",
  },
};

/** `HH:MM AM` from an ISO timestamp, or an em dash when there is none. */
function timeOf(at: string) {
  if (!at) return "—";
  const d = new Date(at);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * `YYYY-MM-DD` for an entry, whichever shape its timestamp takes: real log
 * entries carry an ISO string, the seed data `MM/DD/YYYY HH:MM AM`.
 */
function dayKey(at: string) {
  if (!at) return "";
  const slash = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(at);
  if (slash) return `${slash[3]}-${slash[1]}-${slash[2]}`;
  return at.slice(0, 10);
}

/** Entries arrive newest-first, so first-seen day order is already correct. */
function groupByDay(entries: ActivityEntry[]) {
  const groups: { day: string; items: ActivityEntry[] }[] = [];
  for (const entry of entries) {
    const day = dayKey(entry.at);
    const open = groups.at(-1);
    if (open?.day === day) open.items.push(entry);
    else groups.push({ day, items: [entry] });
  }
  return groups;
}

export function ActivityDrawer() {
  const { activity } = useClose();
  const [filter, setFilter] = React.useState<Filter>("All");
  const [query, setQuery] = React.useState("");
  /** Empty means every date. */
  const [day, setDay] = React.useState("");

  // Narrowing by date first keeps the chip counts honest about what the
  // list will actually show.
  const inRange = React.useMemo(
    () => (day ? activity.filter((e) => dayKey(e.at) === day) : activity),
    [activity, day],
  );

  const counts = React.useMemo(() => {
    const base: Record<Filter, number> = {
      All: inRange.length,
      Checkout: 0,
      Reopen: 0,
      Comment: 0,
    };
    for (const entry of inRange) base[entry.kind] += 1;
    return base;
  }, [inRange]);

  const matches = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inRange.filter((entry) => {
      if (filter !== "All" && entry.kind !== filter) return false;
      if (!needle) return true;
      return (
        entry.description?.toLowerCase().includes(needle) ||
        entry.who.toLowerCase().includes(needle) ||
        entry.store.toLowerCase().includes(needle)
      );
    });
  }, [inRange, filter, query]);

  const groups = React.useMemo(() => groupByDay(matches), [matches]);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button size="sm" variant="outline">
            <HistoryIcon data-icon="inline-start" />
            Activity
            <span className="text-muted-foreground tabular-nums">
              {activity.length}
            </span>
          </Button>
        }
      />
      <SheetContent
        side="right"
        className="gap-0 data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Activity log</SheetTitle>
          <SheetDescription className="text-xs tabular-nums">
            {matches.length} of {activity.length} events
            {day ? " · " + day : null}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 border-b p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user or store"
              aria-label="Search activity"
              className="h-8 pl-8"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              aria-label="Filter activity by date"
              className="h-8 w-40"
            />
            {day ? (
              <Button size="xs" variant="ghost" onClick={() => setDay("")}>
                <XIcon data-icon="inline-start" />
                Clear
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="xs"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f}
                <span
                  className={cn(
                    "tabular-nums",
                    filter === f
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {counts[f]}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {groups.map((group, i) => (
            <section key={group.day}>
              <h3 className="pt-3 pb-1 text-xs font-medium text-muted-foreground tabular-nums">
                {i === 0 ? "Today · " + group.day : group.day}
              </h3>
              <ol className="divide-y">
                {group.items.map((entry) => {
                  const { icon: Icon, verb, tint, ink } = KIND[entry.kind];
                  return (
                    <li key={entry.id} className="flex gap-2.5 py-2.5">
                      <span
                        className={cn(
                          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md",
                          tint,
                        )}
                      >
                        <Icon
                          role="img"
                          aria-label={entry.kind}
                          className={cn("size-3.5", ink)}
                        />
                      </span>
                      <div className="min-w-0">
                        {/* The service sends one sentence per event. Only the
                            seed data has the actor/store/IP breakdown. */}
                        {entry.description ? (
                          <p className="text-sm leading-snug">
                            {entry.description}
                          </p>
                        ) : (
                          <p className="text-sm leading-snug">
                            <span className="font-medium">{entry.who}</span>{" "}
                            {verb}{" "}
                            <span className="font-medium">{entry.store}</span>
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                          {entry.description
                            ? timeOf(entry.at)
                            : entry.at.slice(11) +
                              " · close date " +
                              entry.date +
                              " · IP " +
                              entry.ip}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
          {groups.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {day
                ? "No activity on " + day + "."
                : "No activity matches that search."}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
