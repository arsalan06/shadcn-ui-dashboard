"use client";

import * as React from "react";
import { PageHeader } from "@/components/close/page-header";
import { StatTile, StatTileRow } from "@/components/close/stat-tile";
import { MtdTable } from "@/components/close/mtd/mtd-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MTD_COLUMN_GROUPS,
  MTD_COLUMNS,
  type MtdColumnGroup,
} from "@/lib/mtd-columns";
import {
  MTD_FULTON_SEP2026,
  MTD_PERIOD_LABEL,
  MTD_STORE_LABEL,
} from "@/lib/mtd-data";
import { count, money } from "@/lib/format";

type ViewFilter = "All columns" | MtdColumnGroup;

const VIEW_FILTERS: ViewFilter[] = ["All columns", ...MTD_COLUMN_GROUPS];

export function MtdPage() {
  const [view, setView] = React.useState<ViewFilter>("Sales");

  const rows = MTD_FULTON_SEP2026;
  const columns =
    view === "All columns"
      ? MTD_COLUMNS
      : MTD_COLUMNS.filter((c) => c.group === view);

  const netSales = rows.reduce((s, r) => s + r.net, 0);
  const gross = rows.reduce((s, r) => s + r.gross, 0);
  const customers = rows.reduce((s, r) => s + r.cc, 0);
  const netOverShort = rows.reduce((s, r) => s + r.storeOs, 0);

  return (
    <>
      <PageHeader
        eyebrow={`${MTD_STORE_LABEL} · ${MTD_PERIOD_LABEL} · ${rows.length} days`}
        title="MTD sales"
      />

      <div className="flex min-w-0 flex-col gap-3 p-3">
        <Card size="sm">
          <CardContent className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Store
              </span>
              <Select defaultValue={MTD_STORE_LABEL}>
                <SelectTrigger className="h-8 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fulton (011)">Fulton (011)</SelectItem>
                  <SelectItem value="Bell (021)">Bell (021)</SelectItem>
                  <SelectItem value="Hulen (132)">Hulen (132)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Period
              </span>
              <Input type="month" defaultValue="2026-09" className="h-8 w-40" />
            </div>
            <Button size="sm">Show</Button>
          </CardContent>

          <CardContent className="flex flex-wrap items-center gap-2 border-t pt-3">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Columns
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VIEW_FILTERS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={view === f ? "default" : "outline"}
                  onClick={() => setView(f)}
                  aria-pressed={view === f}
                >
                  {f}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <StatTileRow>
          <StatTile label="MTD net sales" value={money(netSales)} />
          <StatTile label="MTD gross" value={money(gross)} />
          <StatTile label="Customer count" value={count(customers)} />
          <StatTile
            label="Net over / short"
            value={money(netOverShort)}
            note={
              Math.abs(netOverShort) < 0.005 ? "Balanced" : "Needs review"
            }
            status={{
              role: Math.abs(netOverShort) < 0.005 ? "good" : "serious",
              label:
                Math.abs(netOverShort) < 0.005 ? "Balanced" : "Needs review",
            }}
          />
        </StatTileRow>

        <Card size="sm" className="min-w-0">
          <CardHeader className="border-b">
            <CardTitle className="flex flex-wrap items-baseline gap-2">
              Daily detail
              <span className="text-xs font-normal text-muted-foreground">
                Scroll sideways for the remaining columns — Day and Date stay
                fixed
              </span>
            </CardTitle>
          </CardHeader>
          <MtdTable columns={columns} rows={rows} />
        </Card>
      </div>
    </>
  );
}
