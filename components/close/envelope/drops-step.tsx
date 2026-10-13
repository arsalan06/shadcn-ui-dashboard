"use client";

import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatTile, StatTileRow } from "@/components/close/stat-tile";
import { EntryDialog } from "@/components/close/envelope/entry-dialog";
import { VerifyToggle } from "@/components/close/envelope/verify-toggle";
import { useClose } from "@/components/close/close-provider";
import { isBalanced, money, signedMoney } from "@/lib/format";

export function DropsStep() {
  const {
    drops,
    dropsSystemTotal,
    dropsVerifiedTotal,
    expectedCash,
    submitted,
    toggleDrop,
  } = useClose();

  const variance = dropsVerifiedTotal - expectedCash;
  const balanced = isBalanced(variance);

  return (
    <div className="flex flex-col gap-3">
      <StatTileRow>
        <StatTile
          label="Expected cash"
          value={money(expectedCash)}
          note="From the register report"
        />
        <StatTile
          label="Drops recorded"
          value={money(dropsSystemTotal)}
          note={drops.length + (drops.length === 1 ? " drop" : " drops")}
        />
        <StatTile
          label="Manager count"
          value={money(dropsVerifiedTotal)}
          note="Verified entries only"
        />
        <StatTile
          label="Over / short"
          value={signedMoney(variance)}
          note={balanced ? "Balanced" : "Needs a manager note"}
          status={{
            role: balanced ? "good" : "critical",
            label: balanced ? "Balanced" : "Out of balance",
          }}
        />
      </StatTileRow>

      <Card size="sm" className="min-w-0">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            Cash drops
            <Badge variant="secondary" className="tabular-nums">
              {drops.length}
            </Badge>
          </CardTitle>
          <CardAction>
            <EntryDialog kind="drop" />
          </CardAction>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">System</TableHead>
                <TableHead className="text-right">Manager</TableHead>
                <TableHead className="text-right">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drops.map((drop) => (
                <TableRow key={drop.id}>
                  <TableCell className="font-medium whitespace-nowrap tabular-nums">
                    {drop.time}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{drop.cashier}</div>
                    <div className="text-xs text-muted-foreground">
                      {drop.station}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {money(drop.amount)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {money(drop.manager)}
                  </TableCell>
                  <TableCell className="text-right">
                    <VerifyToggle
                      verified={drop.verified}
                      disabled={submitted}
                      onToggle={() => toggleDrop(drop.id)}
                      label={drop.time + " drop"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {drops.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No cash drops recorded for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
