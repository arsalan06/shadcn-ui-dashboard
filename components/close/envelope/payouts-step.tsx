"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatTile, StatTileRow } from "@/components/close/stat-tile";
import { StatusDot } from "@/components/close/status-chip";
import { EntryDialog } from "@/components/close/envelope/entry-dialog";
import { VerifyToggle } from "@/components/close/envelope/verify-toggle";
import { useClose } from "@/components/close/close-provider";
import { isBalanced, money, signedMoney } from "@/lib/format";

type Filter = "All" | "Payout" | "Pay-In";

const FILTERS: Filter[] = ["All", "Payout", "Pay-In"];

export function PayoutsStep() {
  const {
    pays,
    payins,
    payouts,
    payinTotal,
    payoutTotal,
    submitted,
    togglePay,
  } = useClose();
  const [filter, setFilter] = React.useState<Filter>("All");

  const systemPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  const systemPayins = payins.reduce((sum, p) => sum + p.amount, 0);
  // Manager-counted minus register-reported, across both directions.
  const variance = payoutTotal - systemPayouts + (payinTotal - systemPayins);
  const balanced = isBalanced(variance);

  const rows = filter === "All" ? pays : pays.filter((p) => p.type === filter);

  return (
    <div className="flex flex-col gap-3">
      <StatTileRow>
        <StatTile
          label="System payouts"
          value={money(systemPayouts)}
          note={payouts.length + (payouts.length === 1 ? " entry" : " entries")}
        />
        <StatTile
          label="System pay-ins"
          value={money(systemPayins)}
          note={payins.length + (payins.length === 1 ? " entry" : " entries")}
        />
        <StatTile
          label="Manager counted"
          value={money(payoutTotal + payinTotal)}
          note="Payouts plus pay-ins, verified only"
        />
        <StatTile
          label="Over / short"
          value={signedMoney(variance)}
          note={balanced ? "Balanced" : "Recount before check out"}
          status={{
            role: balanced ? "good" : "critical",
            label: balanced ? "Balanced" : "Out of balance",
          }}
        />
      </StatTileRow>

      <Card size="sm" className="min-w-0">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          className="gap-0"
        >
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>Payouts &amp; pay-ins</CardTitle>
              <TabsList>
                {FILTERS.map((f) => (
                  <TabsTrigger key={f} value={f}>
                    {f}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <CardAction className="flex gap-2">
              <EntryDialog kind="payout" />
              <EntryDialog kind="payin" variant="outline" />
            </CardAction>
          </CardHeader>

          <TabsContent value={filter} className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">System</TableHead>
                  <TableHead className="text-right">Manager</TableHead>
                  <TableHead className="text-center">Receipt</TableHead>
                  <TableHead className="text-right">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge
                        variant={
                          entry.type === "Payout" ? "destructive" : "secondary"
                        }
                      >
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap tabular-nums">
                      {entry.time}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.cashier}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.station}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.category}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {money(entry.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {money(entry.manager)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <StatusDot
                          role={entry.receipt ? "good" : "critical"}
                          label={
                            entry.receipt
                              ? "Receipt attached"
                              : "Receipt missing"
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <VerifyToggle
                        verified={entry.verified}
                        disabled={submitted}
                        onToggle={() => togglePay(entry.id)}
                        label={entry.type + " at " + entry.time}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No {filter === "All" ? "entries" : filter + " entries"}{" "}
                      recorded for this date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
