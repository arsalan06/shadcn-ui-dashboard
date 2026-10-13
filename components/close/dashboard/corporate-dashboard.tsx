"use client";

import * as React from "react";
import Link from "next/link";
import { MailIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/close/page-header";
import { StatTile, StatTileRow } from "@/components/close/stat-tile";
import { StatusChip } from "@/components/close/status-chip";
import { ActivityDrawer } from "@/components/close/dashboard/activity-drawer";
import {
  StoreCloseTable,
  STORE_FILTERS,
  type StoreFilter,
} from "@/components/close/dashboard/store-close-table";
import { useClose } from "@/components/close/close-provider";
import { isBalanced, money, signedMoney, usDate } from "@/lib/format";
import { cn } from "cn";

export function CorporateDashboard() {
  const {
    storeRows,
    submitted,
    issues,
    closeDate,
    setCloseDate,
    storesLoading,
  } = useClose();

  // The picker holds the pending date; "Show" is what commits it, which is
  // also what triggers the refetch in the provider.
  const [reportDate, setReportDate] = React.useState(closeDate);
  const appliedDate = closeDate;
  const [filter, setFilter] = React.useState<StoreFilter>("All");
  const [query, setQuery] = React.useState("");

  const counts = React.useMemo(() => {
    const base: Record<StoreFilter, number> = {
      All: storeRows.length,
      "Awaiting store": 0,
      Counted: 0,
      Deposited: 0,
      "No sales": 0,
      Variance: 0,
    };
    for (const row of storeRows) {
      base[row.stage] += 1;
      if (row.bucket === "Variance") base.Variance += 1;
    }
    return base;
  }, [storeRows]);

  const rows = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return storeRows.filter((row) => {
      // Variance cuts across the lifecycle; every other chip is a stage.
      if (filter === "Variance" && row.bucket !== "Variance") return false;
      if (filter !== "All" && filter !== "Variance" && row.stage !== filter) {
        return false;
      }
      if (!needle) return true;
      return row.label.toLowerCase().includes(needle);
    });
  }, [filter, query, storeRows]);

  const awaitingCount = counts["Awaiting store"];
  const systemTotal = storeRows.reduce((sum, r) => sum + r.system, 0);
  const netVariance = storeRows.reduce((sum, r) => sum + r.variance, 0);

  const envelopeCta = submitted
    ? "View submitted envelope"
    : issues.length
      ? "Resume envelope"
      : "Start today's envelope";

  return (
    <>
      <PageHeader
        eyebrow={"Family Thrift Center · " + usDate(appliedDate)}
        title="Daily close"
        actions={
          <>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <Link href="/envelope">
                  <MailIcon data-icon="inline-start" />
                  {envelopeCta}
                </Link>
              }
            />
            <ActivityDrawer />
          </>
        }
      />

      <div className="flex min-w-0 flex-col gap-3 p-3">
        <Card size="sm" className="min-w-0">
          <CardHeader className="border-b">
            <CardTitle className="flex flex-wrap items-center gap-2">
              Corporate daily report
            </CardTitle>
            <CardAction>
              <div className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="report-date" className="text-xs">
                    Report date
                  </Label>
                  <Input
                    id="report-date"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="h-8 w-40"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCloseDate(reportDate)}
                  disabled={reportDate === appliedDate || storesLoading}
                >
                  {storesLoading ? "Loading…" : "Show"}
                </Button>
              </div>
            </CardAction>
          </CardHeader>

          <CardContent className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Filter
            </span>
            {STORE_FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
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
            <div className="relative ml-auto">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search store or number"
                aria-label="Search stores"
                className="h-8 w-52 max-w-full pl-8"
              />
            </div>
          </CardContent>
        </Card>

        <StatTileRow className="lg:grid-cols-5">
          <StatTile
            label="Awaiting store"
            value={String(awaitingCount)}
            note="System sales only"
            status={{
              role: awaitingCount === 0 ? "good" : "critical",
              label: awaitingCount === 0 ? "None outstanding" : "Outstanding",
            }}
          />
          <StatTile
            label="Manager counted"
            value={String(counts.Counted)}
            note="Bank not posted"
            status={{ role: "neutral", label: "In flight" }}
          />
          <StatTile
            label="Bank deposited"
            value={String(counts.Deposited)}
            note={usDate(appliedDate)}
            status={{ role: "good", label: "Cleared" }}
          />
          <StatTile
            label="System total"
            value={money(systemTotal)}
            note="Register reported"
          />
          <StatTile
            label="Net discrepancy"
            value={signedMoney(netVariance)}
            note={
              isBalanced(netVariance)
                ? "Chain balances"
                : "Submitted stores only"
            }
            status={{
              role: isBalanced(netVariance) ? "good" : "serious",
              label: isBalanced(netVariance) ? "Balanced" : "Out of balance",
            }}
          />
        </StatTileRow>

        <StoreCloseTable rows={rows} />
      </div>
    </>
  );
}
