"use client";

import Link from "next/link";
import { CreditCardIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatTile, StatTileRow } from "@/components/close/stat-tile";
import { useClose } from "@/components/close/close-provider";
import { money } from "@/lib/format";

export function ChargesStep() {
  const { charges } = useClose();

  const total = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      <StatTileRow className="lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Charges" value={String(charges.length)} />
        <StatTile label="Charge amount" value={money(total)} />
        <StatTile label="Returns" value="0" />
        <StatTile label="Return amount" value={money(0)} />
        <StatTile label="Voids" value="0" />
        <StatTile label="Void amount" value={money(0)} />
      </StatTileRow>

      <Card size="sm" className="min-w-0">
        <CardHeader className="border-b">
          <CardTitle>Credit card charges</CardTitle>
          <CardAction>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoice or cashier"
                aria-label="Search charges"
                className="h-8 w-56 max-w-full pl-8"
                disabled={charges.length === 0}
              />
            </div>
          </CardAction>
        </CardHeader>

        {charges.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Invoice type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell className="font-medium tabular-nums">
                      {charge.time}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {charge.station}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {charge.invoice}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(charge.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <CreditCardIcon className="size-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No card activity pulled for this date</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              The register reported zero charges, returns and voids, so there is
              nothing to verify here. This is still flagged on the envelope so
              corporate knows the batch was empty rather than missed.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              nativeButton={false}
              render={<Link href="/envelope/checkout">Skip to check out</Link>}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
