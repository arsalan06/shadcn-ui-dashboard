"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CircleCheckIcon,
  PrinterIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/close/page-header";
import { StatusChip } from "@/components/close/status-chip";
import { IssuesPanel } from "@/components/close/envelope/issues-panel";
import { StepNav } from "@/components/close/envelope/step-nav";
import {
  STEPS,
  useClose,
  type StepKey,
} from "@/components/close/close-provider";
import { CLOSE_DATE, MY_STORE_NUM } from "@/lib/close-data";

function stepFromPath(pathname: string): StepKey {
  const match = STEPS.find((s) => pathname.startsWith(s.href));
  return match?.key ?? "drops";
}

export function EnvelopeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { submitted, submittedAt, issues, reopen, submit } = useClose();
  const [doneOpen, setDoneOpen] = React.useState(false);

  const current = stepFromPath(pathname);
  const index = STEPS.findIndex((s) => s.key === current);
  const prev = index > 0 ? STEPS[index - 1] : null;
  const next = index < STEPS.length - 1 ? STEPS[index + 1] : null;

  const status = submitted
    ? { role: "good" as const, label: "Submitted" }
    : index === 0
      ? { role: "neutral" as const, label: "Not started" }
      : { role: "warning" as const, label: "In progress" };

  function handleCheckout() {
    const at = submit();
    setDoneOpen(true);
    toast.success("Envelope checked out", {
      description: "Training Store · 256 locked at " + at,
    });
  }

  return (
    <>
      <PageHeader
        eyebrow={"Daily close · " + CLOSE_DATE}
        title="White envelope"
        badge={<StatusChip role={status.role}>{status.label}</StatusChip>}
        actions={
          <>
            <Select defaultValue={MY_STORE_NUM}>
              <SelectTrigger size="sm" className="w-36" aria-label="Store">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256">Store 256</SelectItem>
                <SelectItem value="118">Store 118</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              defaultValue={CLOSE_DATE}
              aria-label="Close date"
              className="h-8 w-38"
            />
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Print envelope"
            >
              <PrinterIcon />
            </Button>
          </>
        }
      />

      <div className="flex min-w-0 flex-col gap-3 p-3">
        {submitted && (
          <Alert>
            <CircleCheckIcon className="text-status-good" />
            <AlertTitle>Envelope submitted to the corporate office</AlertTitle>
            <AlertDescription>
              Checked out {submittedAt} · read-only until corporate reopens it.
            </AlertDescription>
            <AlertAction>
              <Button variant="outline" size="sm" onClick={reopen}>
                Reopen
              </Button>
            </AlertAction>
          </Alert>
        )}

        {/* <IssuesPanel /> */}
        <StepNav current={current} />

        {children}

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          {prev ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={prev.href}>
                  <ArrowLeftIcon data-icon="inline-start" />
                  {prev.label}
                </Link>
              }
            />
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Autosaved a moment ago
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast("Draft saved", { description: "09/16 5:37 AM" })
              }
            >
              Save as draft
            </Button>
            {next ? (
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <Link href={next.href}>
                    {next.label}
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                }
              />
            ) : (
              <Button size="sm" onClick={handleCheckout} disabled={submitted}>
                {submitted ? "Submitted" : "Check out envelope"}
              </Button>
            )}
          </div>
        </div>

        {!submitted && issues.length > 0 && index === STEPS.length - 1 && (
          <p className="text-xs text-muted-foreground">
            {issues.length} open issue{issues.length === 1 ? "" : "s"} will be
            sent to corporate with this envelope.
          </p>
        )}
      </div>

      <Dialog open={doneOpen} onOpenChange={setDoneOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mx-auto mb-1 flex size-11 items-center justify-center rounded-full bg-status-good/10">
              <CircleCheckIcon className="size-5 text-status-good" />
            </div>
            <DialogTitle className="text-center">
              Envelope checked out
            </DialogTitle>
            <DialogDescription className="text-center">
              Training Store · 256 for {CLOSE_DATE} is locked and sent to the
              corporate office for review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setDoneOpen(false);
                router.push("/");
              }}
            >
              Back to dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
