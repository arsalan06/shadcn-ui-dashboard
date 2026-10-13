import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MtdDay } from "@/lib/mtd-data";
import { columnHasTotal, type MtdColumn } from "@/lib/mtd-columns";
import { count, money } from "@/lib/format";
import { cn } from "cn";

const DAY_COL = "sticky left-0 z-10 w-12 min-w-12 border-r whitespace-nowrap";
const DATE_COL = "sticky left-12 z-10 w-20 min-w-20 border-r whitespace-nowrap";

function formatCell(value: number | string, column: MtdColumn): string {
  if (column.format === "text") return String(value || "—");
  const n = Number(value) || 0;
  return column.format === "money" ? money(n) : count(n);
}

function varianceClass(n: number): string {
  if (Math.abs(n) < 0.005) return "text-status-good";
  return n > 0 ? "text-status-warning" : "text-status-critical";
}

function cellClass(column: MtdColumn, raw: number | string) {
  return cn(
    column.wide ? "max-w-56 truncate text-left" : "text-right tabular-nums",
    column.strong && "font-semibold",
    column.variance && varianceClass(Number(raw) || 0),
  );
}

export function MtdTable({
  columns,
  rows,
}: {
  columns: MtdColumn[];
  rows: MtdDay[];
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(DAY_COL, "bg-muted/50")}>Day</TableHead>
            <TableHead className={cn(DATE_COL, "bg-muted/50")}>Date</TableHead>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.wide ? "min-w-40 text-left" : "min-w-16 text-right",
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.date}>
              <TableCell className={cn(DAY_COL, "bg-background font-medium")}>
                {row.day}
              </TableCell>
              <TableCell
                className={cn(
                  DATE_COL,
                  "bg-background tabular-nums text-muted-foreground",
                )}
              >
                {row.date}
              </TableCell>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cellClass(col, row[col.key])}
                >
                  {formatCell(row[col.key], col)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell className={cn(DAY_COL, "bg-muted/50 font-semibold")}>
              MTD
            </TableCell>
            <TableCell className={cn(DATE_COL, "bg-muted/50 font-semibold")}>
              Total
            </TableCell>
            {columns.map((col) => {
              const sum = rows.reduce(
                (s, r) => s + (Number(r[col.key]) || 0),
                0,
              );
              return (
                <TableCell
                  key={col.key}
                  className={cn(
                    "font-semibold",
                    col.wide ? "text-left" : "text-right tabular-nums",
                    col.variance && columnHasTotal(col) && varianceClass(sum),
                  )}
                >
                  {columnHasTotal(col) ? formatCell(sum, col) : ""}
                </TableCell>
              );
            })}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
