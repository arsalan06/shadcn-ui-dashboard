import {
  ClockIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  LinkIcon,
  PresentationIcon,
  type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CitadelForm, FormFile } from "@/lib/citadel-forms";
import { cn } from "cn";

/**
 * The old screen used a coloured glyph per file type. Keeping the hue is
 * useful — a manager scans for "the PDF" — but the icon shape carries the
 * same information, so the colour is never the only signal.
 */
const FILE_ICON: Record<string, { icon: LucideIcon; ink: string }> = {
  pdf: { icon: FileTextIcon, ink: "text-red-600 dark:text-red-400" },
  doc: { icon: FileTextIcon, ink: "text-blue-600 dark:text-blue-400" },
  docx: { icon: FileTextIcon, ink: "text-blue-600 dark:text-blue-400" },
  odt: { icon: FileTextIcon, ink: "text-blue-600 dark:text-blue-400" },
  xls: { icon: FileSpreadsheetIcon, ink: "text-green-700 dark:text-green-400" },
  xlsx: { icon: FileSpreadsheetIcon, ink: "text-green-700 dark:text-green-400" },
  ods: { icon: FileSpreadsheetIcon, ink: "text-green-700 dark:text-green-400" },
  csv: { icon: FileSpreadsheetIcon, ink: "text-green-700 dark:text-green-400" },
  ppt: { icon: PresentationIcon, ink: "text-orange-600 dark:text-orange-400" },
  pptx: { icon: PresentationIcon, ink: "text-orange-600 dark:text-orange-400" },
  jpg: { icon: ImageIcon, ink: "text-violet-600 dark:text-violet-400" },
  jpeg: { icon: ImageIcon, ink: "text-violet-600 dark:text-violet-400" },
  png: { icon: ImageIcon, ink: "text-violet-600 dark:text-violet-400" },
  gif: { icon: ImageIcon, ink: "text-violet-600 dark:text-violet-400" },
  bmp: { icon: ImageIcon, ink: "text-violet-600 dark:text-violet-400" },
};

function fileGlyph(file: FormFile) {
  if (file.type === "link") {
    return { icon: LinkIcon, ink: "text-sky-600 dark:text-sky-400" };
  }
  return FILE_ICON[file.ext] ?? { icon: FileIcon, ink: "text-muted-foreground" };
}

function stamp(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FormCard({ form }: { form: CitadelForm }) {
  const edited = stamp(form.edited);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card">
      <h3 className="bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
        {form.title}
      </h3>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {edited ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <ClockIcon aria-hidden className="size-3.5 shrink-0" />
            {edited}
          </p>
        ) : null}

        <p
          className={cn(
            "text-sm leading-snug",
            form.description ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {form.description ?? "No description provided"}
        </p>
      </div>

      {form.files.length ? (
        <ul className="flex flex-wrap items-center gap-2 border-t bg-muted/40 px-3 py-2">
          {form.files.map((file) => {
            const { icon: Icon, ink } = fileGlyph(file);
            const label =
              file.type === "link" ? `Link: ${file.name}` : file.name;

            return (
              <li key={file.id}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={label}
                          className="block rounded p-0.5 hover:bg-accent"
                        >
                          <Icon className={cn("size-5", ink)} aria-hidden />
                        </a>
                      ) : (
                        <span className="block p-0.5">
                          <Icon
                            className={cn("size-5", ink)}
                            role="img"
                            aria-label={label}
                          />
                        </span>
                      )
                    }
                  />
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      ) : null}
    </article>
  );
}
