"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VarianceBar } from "@/components/close/variance-bar";
import { useClose } from "@/components/close/close-provider";
import {
  DENOMINATIONS,
  PIECE_COUNTS,
  STORE_CHECKS,
  type CashDrop,
} from "@/lib/close-data";
import { isBalanced, money, signedMoney, toNumber } from "@/lib/format";
import { cn } from "cn";

function byStation(drops: CashDrop[]) {
  const map = new Map<string, number>();
  for (const drop of drops) {
    map.set(drop.station, (map.get(drop.station) ?? 0) + drop.manager);
  }
  return [...map.entries()].map(([station, total]) => ({ station, total }));
}

/**
 * The design's count fields are bare right-aligned numbers. Chrome's spinner
 * buttons would eat most of a 48–58px field and clip the value, so they're
 * suppressed here rather than widening every column to make room for them.
 */
const NO_SPINNER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/** Small-caps label sitting above a field or read-only value. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-extrabold tracking-wide text-muted-foreground uppercase">
      {children}
    </span>
  );
}

/** Shared row shell for the three checklist groups, so they align on one grid. */
function ChecklistRow({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 border-b py-0.75",
        onClick && "cursor-pointer",
      )}
    >
      {children}
    </div>
  );
}

export function CheckoutStep() {
  const {
    checks,
    countedCash,
    denoms,
    drops,
    expectedCash,
    note,
    overShort,
    payinTotal,
    payouts,
    payoutTotal,
    pieces,
    setDenom,
    setNote,
    setPiece,
    submitted,
    toggleCheck,
  } = useClose();

  const balanced = isBalanced(overShort);
  const coinTotal = Number(denoms.coin) || 0;
  // "Currency" is the counted cash net of coin — coin is counted on its own
  // line, then folded back in for the grand total.
  const currencyTotal = countedCash - coinTotal;

  const cashierRows = drops.map((drop) => ({
    key: drop.id,
    name: drop.cashier,
    station: drop.station,
    expected: expectedCash,
    manager: drop.manager,
    variance: drop.manager - expectedCash,
  }));

  const stationRows = byStation(drops).map((row) => ({
    ...row,
    expected: expectedCash,
    variance: row.total - expectedCash,
  }));

  const maxCashier = cashierRows.reduce(
    (m, r) => Math.max(m, Math.abs(r.variance)),
    0,
  );
  const maxStation = stationRows.reduce(
    (m, r) => Math.max(m, Math.abs(r.variance)),
    0,
  );

  const summaryRows = [
    { label: "Currency", value: money(currencyTotal), weight: 600 },
    { label: "Coin", value: money(coinTotal), weight: 600 },
    {
      label: "Payouts",
      value: "-" + money(payoutTotal),
      weight: 600,
      tone: "critical" as const,
    },
    {
      label: "Pay-ins",
      value: "+" + money(payinTotal),
      weight: 600,
      tone: "good" as const,
    },
    { label: "Credit card charges", value: money(0), weight: 600 },
    { label: "Cash refund", value: money(0), weight: 600 },
    { label: "Credit card refund", value: money(0), weight: 600 },
    {
      label: "Total cash, payouts, pay-in, refunds and credit card refund",
      value: money(countedCash + payinTotal - payoutTotal),
      weight: 800,
    },
  ];

  const depositRows = [
    {
      label: (drops[0]?.station ?? "Station") + " cash - retail",
      value: money(countedCash),
      weight: 600,
    },
    { label: "Total cash deposit", value: money(currencyTotal), weight: 600 },
    { label: "Total store deposited", value: money(countedCash), weight: 800 },
  ];

  // The register's own over/short, and the payout drawer's — both compared
  // manager-counted against register-reported.
  const registerOverShort = countedCash - expectedCash;
  const payoutSystemTotal = payouts.reduce((sum, p) => sum + p.amount, 0);
  const payoutOverShort = payoutTotal - payoutSystemTotal;

  const calcRows: {
    label: string;
    value: string;
    tone?: "good" | "critical";
  }[] = [
    {
      label: "Manager Cash Total (only verified manager values included)",
      value: money(countedCash),
    },
    { label: "Deposit Total", value: money(expectedCash) },
    {
      label: "Store Over/Short",
      value: money(overShort),
      tone: balanced ? "good" : "critical",
    },
    {
      label: "Register Total Over/Short",
      value: money(registerOverShort),
      tone: isBalanced(registerOverShort) ? "good" : "critical",
    },
    {
      label: "Qty. Shopping Carts",
      value: (Number(pieces.carts) || 0).toFixed(2),
    },
    {
      label: "Payouts (only verified manager values included)",
      value: money(payoutTotal),
    },
    {
      label: "Pay-Out Over/Short",
      value: money(payoutOverShort),
      tone: isBalanced(payoutOverShort) ? "good" : "critical",
    },
  ];

  const summaryVerdict = balanced
    ? "Currency count balances"
    : "Currency count is " +
      (overShort > 0 ? "Over" : "Short") +
      " by " +
      money(Math.abs(overShort));

  const corporateNote =
    "Give me a reason for the " +
    money(Math.abs(overShort)) +
    " variance before this envelope is approved.";

  const toneClass = (tone?: "good" | "critical") =>
    tone === "good"
      ? "text-status-good"
      : tone === "critical"
        ? "text-status-critical"
        : undefined;

  return (
    <div className="flex flex-col gap-2.25">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <h2 className="text-[13px] font-extrabold">Store Summary</h2>
        <span
          className={cn(
            "text-[11px] font-bold",
            balanced ? "text-status-good" : "text-status-critical",
          )}
        >
          {summaryVerdict}
        </span>
      </div>

      <div className="grid gap-[7px] lg:grid-cols-3">
        {/* --- denomination count ------------------------------------------ */}
        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="flex items-center gap-1.5 text-[11px]">
              <span className="flex-1">Manager cash count</span>
              <span className="text-[11.5px] font-extrabold tabular-nums">
                {money(countedCash)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2.25 py-1">
            {DENOMINATIONS.map((denom) => {
              const value = denoms[denom.key];
              return (
                <div
                  key={denom.key}
                  className="flex items-center gap-2.5 border-b py-1"
                >
                  <Label
                    htmlFor={"denom-" + denom.key}
                    className="flex-1 text-[11.5px] font-semibold"
                  >
                    {denom.label}
                  </Label>
                  <Input
                    id={"denom-" + denom.key}
                    type="number"
                    min="0"
                    inputMode="numeric"
                    disabled={submitted}
                    value={value}
                    onChange={(e) =>
                      setDenom(denom.key, toNumber(e.target.value))
                    }
                    className={cn(
                      "h-7 w-[58px] text-right text-[11.5px] tabular-nums",
                      NO_SPINNER,
                    )}
                  />
                  <span className="w-17 text-right text-[11.5px] font-bold text-muted-foreground tabular-nums">
                    {money(value * denom.unit)}
                  </span>
                </div>
              );
            })}
            <div className="mt-1 flex flex-col gap-0.75">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-[11px] font-bold">
                  Currency total
                </span>
                <span className="text-[12px] font-extrabold tabular-nums">
                  {money(currencyTotal)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex-1 text-[11px] font-bold">
                  Grand total (incl. coin)
                </span>
                <span className="text-[12px] font-extrabold tabular-nums">
                  {money(countedCash)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- reconciliation ---------------------------------------------- */}
        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="text-[11px]">
              Deposit reconciliation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col px-2.25 py-0.75">
            {summaryRows.slice(0, -1).map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-2 border-b py-0.75"
              >
                <span
                  className={cn(
                    "flex-1 text-[11.5px]",
                    row.weight === 800 ? "font-extrabold" : "font-semibold",
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "text-right text-[12px] tabular-nums",
                    row.weight === 800 ? "font-extrabold" : "font-semibold",
                    toneClass(row.tone),
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {summaryRows.slice(-1).map((row) => (
              <div key={row.label} className="mt-auto flex items-center gap-2 ">
                <span
                  className={cn(
                    "flex-1 text-[11.5px]",
                    row.weight === 800 ? "font-extrabold" : "font-semibold",
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "text-right text-[12px] tabular-nums",
                    row.weight === 800 ? "font-extrabold" : "font-semibold",
                    toneClass(row.tone),
                  )}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* --- deposit summary --------------------------------------------- */}
        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="text-[11px]">
              Stations Deposit summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-0.75 px-2.25 py-1.75">
            <div className="flex items-center gap-1.5">
              <span className="flex-1 truncate text-[11.5px] font-semibold">
                {depositRows[0].label}
              </span>
              <span className="text-[11.5px] font-semibold tabular-nums">
                {depositRows[0].value}
              </span>
            </div>

            <div className="mt-auto flex flex-col gap-0.75">
              {depositRows.slice(1).map((row) => (
                <div key={row.label} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex-1 truncate text-[11.5px]",
                      row.weight === 800 ? "font-extrabold" : "font-semibold",
                    )}
                  >
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "text-[11.5px] tabular-nums",
                      row.weight === 800 ? "font-extrabold" : "font-semibold",
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- checklist + deposit summary -------------------------------------
          Store checklist (computed totals, piece counts, yes/no checks) sits
          beside the deposit summary card. */}
      <div className="grid gap-[7px] lg:grid-cols-[1fr_1fr]">
        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="text-[11px]">Store checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-y-px px-2.25 py-1">
            {calcRows.map((row) => (
              <ChecklistRow key={row.label}>
                <span className="flex-1 text-[11px] leading-tight font-semibold">
                  {row.label}
                </span>
                <span
                  className={cn(
                    "text-[11.5px] font-extrabold tabular-nums",
                    toneClass(row.tone),
                  )}
                >
                  {row.value}
                </span>
              </ChecklistRow>
            ))}

            {PIECE_COUNTS.map((piece) => (
              <ChecklistRow key={piece.key}>
                <Label
                  htmlFor={"piece-" + piece.key}
                  className="flex-1 text-[11px] font-semibold"
                >
                  {piece.label}
                </Label>
                <Input
                  id={"piece-" + piece.key}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  disabled={submitted}
                  value={pieces[piece.key]}
                  onChange={(e) =>
                    setPiece(piece.key, toNumber(e.target.value))
                  }
                  className={cn(
                    "h-6 w-14 text-right text-[11px] tabular-nums",
                    NO_SPINNER,
                  )}
                />
              </ChecklistRow>
            ))}

            {STORE_CHECKS.map((check) => (
              <ChecklistRow
                key={check.key}
                onClick={submitted ? undefined : () => toggleCheck(check.key)}
              >
                <Checkbox
                  checked={checks[check.key]}
                  disabled={submitted}
                  onCheckedChange={() => toggleCheck(check.key)}
                  className="size-4"
                />
                <span className="flex-1 text-[11px] font-semibold">
                  {check.label}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold",
                    checks[check.key]
                      ? "text-status-good"
                      : "text-muted-foreground",
                  )}
                >
                  {checks[check.key] ? check.done : "—"}
                </span>
              </ChecklistRow>
            ))}
          </CardContent>
        </Card>

        {/* --- notes -------------------------------------------------------- */}
        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="text-[11px]">Manager notes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 px-2.25 py-1.5">
            <label className="flex flex-col gap-1" htmlFor="manager-note">
              <FieldLabel>Comments / notes</FieldLabel>
              <Textarea
                id="manager-note"
                value={note}
                disabled={submitted}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Explain any over/short, camera checks or exceptions…"
                className="min-h-28 text-[11px] leading-relaxed"
              />
            </label>
            <div className="flex flex-col gap-1">
              <FieldLabel>Corporate office comments / notes</FieldLabel>
              <div className="min-h-28 rounded-lg border bg-muted/60 px-2.25 py-1.75 text-[11px] leading-relaxed text-secondary-foreground">
                {corporateNote}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- variance breakdowns -------------------------------------------- */}
      <div className="grid gap-[7px] lg:grid-cols-2">
        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="text-[11px]">
              Over / short by cashier
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-7 px-[7px] text-[9.5px] tracking-wide uppercase">
                    Cashier
                  </TableHead>
                  <TableHead className="h-7 px-[7px] text-right text-[9.5px] tracking-wide uppercase">
                    Expected
                  </TableHead>
                  <TableHead className="h-7 px-[7px] text-right text-[9.5px] tracking-wide uppercase">
                    Manager
                  </TableHead>
                  <TableHead className="h-7 w-24 px-[7px] text-[9.5px] tracking-wide uppercase">
                    Over / short
                  </TableHead>
                  <TableHead className="h-7 px-[7px] text-right text-[9.5px] tracking-wide uppercase">
                    Variance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashierRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="px-[7px] py-[5px] text-[11px]">
                      <div className="font-semibold">{row.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {row.station}
                      </div>
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px] text-right text-[11px] text-muted-foreground tabular-nums">
                      {money(row.expected)}
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px] text-right text-[11px] tabular-nums">
                      {money(row.manager)}
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px]">
                      <VarianceBar value={row.variance} max={maxCashier} />
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px] text-right text-[11px] font-extrabold tabular-nums">
                      {signedMoney(row.variance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card size="sm" className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b px-2.25 py-2">
            <CardTitle className="text-[11px]">
              Over / short by station
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-7 px-[7px] text-[9.5px] tracking-wide uppercase">
                    Station
                  </TableHead>
                  <TableHead className="h-7 px-[7px] text-right text-[9.5px] tracking-wide uppercase">
                    Expected
                  </TableHead>
                  <TableHead className="h-7 px-[7px] text-right text-[9.5px] tracking-wide uppercase">
                    Total
                  </TableHead>
                  <TableHead className="h-7 w-24 px-[7px] text-[9.5px] tracking-wide uppercase">
                    Over / short
                  </TableHead>
                  <TableHead className="h-7 px-[7px] text-right text-[9.5px] tracking-wide uppercase">
                    Variance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stationRows.map((row) => (
                  <TableRow key={row.station}>
                    <TableCell className="px-[7px] py-[5px] text-[11px] font-semibold">
                      {row.station}
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px] text-right text-[11px] text-muted-foreground tabular-nums">
                      {money(row.expected)}
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px] text-right text-[11px] tabular-nums">
                      {money(row.total)}
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px]">
                      <VarianceBar value={row.variance} max={maxStation} />
                    </TableCell>
                    <TableCell className="px-[7px] py-[5px] text-right text-[11px] font-extrabold tabular-nums">
                      {signedMoney(row.variance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
