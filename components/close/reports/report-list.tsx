"use client";

import { SearchIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ALL_REPORTS, REPORT_GROUPS, slugifyReport } from "@/lib/reports-data";
import { cn } from "cn";

export function ReportList({
  query,
  onQueryChange,
  selectedId,
  onSelect,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const needle = query.trim().toLowerCase();
  const groups = REPORT_GROUPS.map((g) => ({
    group: g.group,
    items: g.items.filter((name) => !needle || name.toLowerCase().includes(needle)),
  })).filter((g) => g.items.length > 0);

  return (
    <Card size="sm" className="sticky top-15 min-w-0">
      <CardHeader className="border-b">
        <CardTitle className="flex items-baseline gap-1.5">
          All reports
          <span className="text-xs font-normal text-muted-foreground">
            {ALL_REPORTS.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 border-b pb-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Find a report…"
            aria-label="Find a report"
            className="h-8 pl-8"
          />
        </div>
      </CardContent>
      <div className="flex max-h-[calc(100vh-13rem)] flex-col gap-3 overflow-y-auto px-2 py-2">
        {groups.map((g) => (
          <div key={g.group} className="flex flex-col gap-0.5">
            <div className="px-1.5 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              {g.group}
            </div>
            {g.items.map((name) => {
              const id = slugifyReport(name);
              const active = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-md border-l-2 border-transparent px-2 py-1.5 text-left text-xs leading-tight text-foreground/80 transition-colors hover:bg-muted",
                    active &&
                      "border-primary bg-accent font-medium text-primary hover:bg-accent",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="px-1.5 py-4 text-center text-xs text-muted-foreground">
            No reports match “{query}”.
          </div>
        )}
      </div>
    </Card>
  );
}
