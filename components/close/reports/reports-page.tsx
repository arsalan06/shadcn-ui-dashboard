"use client";

import * as React from "react";
import { PageHeader } from "@/components/close/page-header";
import { ReportList } from "@/components/close/reports/report-list";
import { ReportTable } from "@/components/close/reports/report-table";
import { FormulasCard } from "@/components/close/reports/formulas-card";
import { ALL_REPORTS, DEFAULT_REPORT_ID, slugifyReport } from "@/lib/reports-data";

export function ReportsPage() {
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(DEFAULT_REPORT_ID);

  const activeReport =
    ALL_REPORTS.find((name) => slugifyReport(name) === selectedId) ??
    ALL_REPORTS[0];

  return (
    <>
      <PageHeader
        eyebrow="Family Thrift Center · Corporate"
        title="Reports"
      />

      <div className="grid min-w-0 grid-cols-1 items-start gap-3 p-3 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ReportList
          query={query}
          onQueryChange={setQuery}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <div className="flex min-w-0 flex-col gap-3">
          <ReportTable title={activeReport} />
          <FormulasCard />
        </div>
      </div>
    </>
  );
}
