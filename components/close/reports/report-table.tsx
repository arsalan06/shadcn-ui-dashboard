import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REPORT_ROWS, REPORT_TOTALS, type ReportRow } from "@/lib/reports-data";
import { count, money } from "@/lib/format";

const COLUMNS: {
  key: keyof Omit<ReportRow, "store">;
  label: string;
  format: (n: number) => string;
}[] = [
  { key: "salesTotal", label: "Sales Total", format: money },
  { key: "cc", label: "CC", format: count },
  { key: "vpc", label: "VPC", format: money },
  { key: "items", label: "#Items", format: count },
  { key: "valuePerItem", label: "Value / Item", format: money },
  { key: "discOther", label: "Total Disc Other", format: money },
  { key: "wtd", label: "WTD", format: money },
  { key: "vpnlc", label: "VPNLC", format: money },
  { key: "vplc", label: "VPLC", format: money },
];

export function ReportTable({ title }: { title: string }) {
  return (
    <Card size="sm" className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <Label htmlFor="report-run-date" className="text-xs">
                Report date
              </Label>
              <Input
                id="report-run-date"
                type="date"
                defaultValue="2026-09-18"
                className="h-8 w-40"
              />
            </div>
            <Button size="sm" variant="outline">
              Show
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <div className="overflow-x-auto border-b">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              {COLUMNS.map((col) => (
                <TableHead key={col.key} className="text-right">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {REPORT_ROWS.map((row) => (
              <TableRow key={row.store}>
                <TableCell className="font-medium">{row.store}</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.key}
                    className="text-right text-muted-foreground tabular-nums"
                  >
                    {col.format(row[col.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold">Sub Total</TableCell>
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.key}
                  className="text-right font-semibold tabular-nums"
                >
                  {col.format(REPORT_TOTALS[col.key])}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </Card>
  );
}
