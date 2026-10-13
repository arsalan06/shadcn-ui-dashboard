"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDownIcon, TriangleAlertIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { STEPS, useClose } from "@/components/close/close-provider";

export function IssuesPanel() {
  const { issues, submitted } = useClose();
  const [open, setOpen] = React.useState(false);

  if (submitted || issues.length === 0) return null;

  const hrefFor = (key: string) =>
    STEPS.find((s) => s.key === key)?.href ?? "/envelope";

  return (
    <Card size="sm" className="gap-0 py-0 ring-status-warning/40">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2.5 p-3 text-left">
          <TriangleAlertIcon className="size-4 shrink-0 text-status-warning" />
          <span className="text-sm font-medium">Envelope needs attention</span>
          <Badge variant="outline" className="tabular-nums">
            {issues.length}
          </Badge>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            {open ? "Hide" : "Review"}
            <ChevronDownIcon
              className="size-3.5 transition-transform data-[open=true]:rotate-180"
              data-open={open}
            />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="divide-y border-t">
            {issues.map((issue) => (
              <li
                key={issue.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5"
              >
                <Link
                  href={hrefFor(issue.step)}
                  className="min-w-36 text-xs font-medium text-muted-foreground uppercase hover:text-foreground hover:underline"
                >
                  {issue.stepLabel}
                </Link>
                <span className="flex-1 text-sm">{issue.text}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
