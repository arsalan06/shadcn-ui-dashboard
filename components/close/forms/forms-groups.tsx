"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormCard } from "@/components/close/forms/form-card";
import type { FormGroup } from "@/lib/citadel-forms";

export function FormsGroups({ groups }: { groups: FormGroup[] }) {
  const [query, setQuery] = React.useState("");

  // Searching narrows the forms inside each group and drops groups that end
  // up empty, so the page never shows a heading with nothing under it.
  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;

    return groups
      .map((group) => ({
        ...group,
        forms: group.forms.filter(
          (f) =>
            f.title.toLowerCase().includes(needle) ||
            f.description?.toLowerCase().includes(needle) ||
            group.title.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.forms.length > 0);
  }, [groups, query]);

  const total = groups.reduce((n, g) => n + g.forms.length, 0);
  const shown = visible.reduce((n, g) => n + g.forms.length, 0);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground tabular-nums">
          {shown === total ? `${total} forms` : `${shown} of ${total} forms`}
        </p>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search forms"
            aria-label="Search forms"
            className="h-8 w-56 pl-8"
          />
        </div>
      </div>

      {visible.map((group) => (
        <section key={group.id} className="flex min-w-0 flex-col gap-2">
          <h2 className="text-base font-semibold">{group.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.forms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </section>
      ))}

      {visible.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {total === 0
            ? "No forms published."
            : "No forms match that search."}
        </p>
      )}
    </div>
  );
}
