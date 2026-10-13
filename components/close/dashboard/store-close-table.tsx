"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, EllipsisIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useClose,
  type StoreRow,
  type StoreStage,
} from "@/components/close/close-provider";
import {
  StatusChip,
  StatusDot,
  type StatusRole,
} from "@/components/close/status-chip";
import { isBalanced, money, signedMoney } from "@/lib/format";
import { cn } from "cn";

export type StoreFilter = "All" | StoreStage | "Variance";

/** "No sales" is deliberately absent: it is a non-state, reachable via All. */
export const STORE_FILTERS: StoreFilter[] = [
  "All",
  "Awaiting store",
  "Counted",
  "Deposited",
  "Variance",
];

/**
 * The stage palette is drawn from the fixed four-role status set, so a stage
 * never invents a colour. "Counted" and "No sales" share the neutral role —
 * both are simply "not there yet" — and are told apart by their labels, which
 * every chip carries anyway.
 */
const STAGE_ROLE: Record<StoreStage, StatusRole> = {
  Deposited: "good",
  Counted: "neutral",
  "Awaiting store": "critical",
  "No sales": "neutral",
};

const STAGE_LEGEND: { stage: StoreStage; label: string }[] = [
  { stage: "Awaiting store", label: "System only" },
  { stage: "Counted", label: "Manager counted" },
  { stage: "Deposited", label: "Bank deposited" },
];

const notWired = (action: string) =>
  toast(action, { description: "Not wired up in this prototype yet." });

/**
 * An over drawer is unaccounted-for cash; a short one is missing cash, which
 * is worse — so the two directions take different roles rather than one hue.
 */
function varianceInk(value: number): string {
  if (isBalanced(value)) return "text-muted-foreground";
  return value > 0 ? "text-green-600" : "text-status-serious";
}

/** A direction arrow beside a figure, labelled so it is not colour-only. */
function VarianceMark({ value, label }: { value: number; label: string }) {
  if (isBalanced(value)) return null;
  const Icon = value > 0 ? ArrowUpIcon : ArrowDownIcon;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span>
            <Icon
              role="img"
              aria-label={label}
              className={cn("size-3", varianceInk(value))}
            />
          </span>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function StoreActions({ row }: { row: StoreRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon-xs" variant="ghost" aria-label="Store actions">
            <EllipsisIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{row.label}</DropdownMenuLabel>
          {row.isMine ? (
            <DropdownMenuItem render={<Link href="/envelope" />}>
              Open white envelope
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => notWired("Open white envelope · " + row.label)}
            >
              Open white envelope
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => notWired("Bank deposit information")}
          >
            Bank deposit information
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => notWired("Show deposit slip")}>
            Show deposit slip
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => notWired("Payout list")}>
            Payout list
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Reports</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/reports" />}>
            Daily money report
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/mtd-sales" />}>
            View MTD sales
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => notWired("Drop cash summary")}>
            Drop cash summary
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/reports" />}>
            CC sales detail report
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => notWired("Pull CC batch")}>
            Pull CC batch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => notWired("Send fax")}>
            Send fax
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => notWired("Contact store")}>
            Contact store
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StoreCloseTable({ rows }: { rows: StoreRow[] }) {
  const { storeRows } = useClose();
  const [selected, setSelected] = React.useState<string[]>([]);

  // Rows can leave the view when the filter changes; a selection that points at
  // hidden stores would act on things the user can no longer see.
  const visible = React.useMemo(
    () => selected.filter((num) => rows.some((r) => r.num === num)),
    [rows, selected],
  );
  const allChecked = visible.length > 0 && visible.length === rows.length;

  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.num));

  const toggleOne = (num: string) =>
    setSelected((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );

  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>Store daily close</CardTitle>
        <CardAction className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {STAGE_LEGEND.map((l) => (
            <span
              key={l.stage}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <StatusDot
                role={STAGE_ROLE[l.stage]}
                label={l.stage}
                className="size-3.5"
              />
              {l.label}
            </span>
          ))}
          <span className="text-xs text-muted-foreground tabular-nums">
            {rows.length} of {storeRows.length} stores
          </span>
        </CardAction>
      </CardHeader>

      {visible.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted px-(--card-spacing) py-2">
          <span className="text-xs font-medium tabular-nums">
            {visible.length} store{visible.length === 1 ? "" : "s"} selected
          </span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant="outline"
              onClick={() => notWired("Contact stores")}
            >
              Contact stores
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => notWired("Send fax")}
            >
              Send fax
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => notWired("Pull CC batch")}
            >
              Pull CC batch
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-0">
                <Checkbox
                  checked={allChecked}
                  indeterminate={visible.length > 0 && !allChecked}
                  onCheckedChange={toggleAll}
                  aria-label="Select all stores"
                  // The shared indicator draws a tick whenever it renders, and
                  // it renders for indeterminate too — swap it for a dash so a
                  // partial selection cannot read as a full one.
                  className="data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current data-indeterminate:before:content-[''] data-indeterminate:[&_svg]:hidden"
                />
              </TableHead>
              <TableHead>Store</TableHead>
              <TableHead className="text-right">System</TableHead>
              <TableHead className="text-right">Manager</TableHead>
              <TableHead className="text-right">Bank</TableHead>
              <TableHead className="text-right">Disc.</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.num}
                data-state={selected.includes(row.num) ? "selected" : undefined}
                className={cn(row.isMine && "bg-accent/60")}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(row.num)}
                    onCheckedChange={() => toggleOne(row.num)}
                    aria-label={"Select " + row.label}
                  />
                </TableCell>

                <TableCell className="font-medium whitespace-nowrap">
                  {row.store}{" "}
                  <span className="text-muted-foreground tabular-nums">
                    {row.num}
                  </span>
                </TableCell>

                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {money(row.system)}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {row.missing ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="inline-flex items-center justify-end gap-1">
                      <VarianceMark
                        value={row.variance}
                        label={
                          "Manager " +
                          (row.variance > 0 ? "over" : "short") +
                          " " +
                          money(Math.abs(row.variance)) +
                          " vs system"
                        }
                      />
                      {money(row.manager)}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right tabular-nums">
                  {row.bank === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="inline-flex items-center justify-end gap-1">
                      <VarianceMark
                        value={row.bankVariance}
                        label={
                          "Bank " +
                          (row.bankVariance > 0 ? "over" : "short") +
                          " " +
                          money(Math.abs(row.bankVariance)) +
                          " vs manager count"
                        }
                      />
                      {money(row.bank)}
                    </span>
                  )}
                </TableCell>

                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    varianceInk(row.variance),
                  )}
                >
                  {row.missing ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    signedMoney(row.variance)
                  )}
                </TableCell>

                {/* White-envelope comments exactly as the service returns
                    them — not a sentence derived from the variance. */}
                <TableCell className="max-w-40 text-xs text-muted-foreground">
                  {row.comments ? (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="line-clamp-2 cursor-default">
                            {row.comments}
                          </span>
                        }
                      />
                      <TooltipContent className="max-w-xs">
                        {row.comments}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </TableCell>

                <TableCell>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span>
                          <StatusChip role={STAGE_ROLE[row.stage]}>
                            {row.stage}
                          </StatusChip>
                        </span>
                      }
                    />
                    <TooltipContent>{row.stageLabel}</TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="text-right">
                  <StoreActions row={row} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-muted-foreground"
                >
                  No stores match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
