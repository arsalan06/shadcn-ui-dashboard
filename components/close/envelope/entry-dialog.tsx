"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClose } from "@/components/close/close-provider";
import { MY_MANAGER, PAYOUT_CATEGORIES, STATIONS } from "@/lib/close-data";
import { money, toNumber } from "@/lib/format";

export type EntryKind = "drop" | "payout" | "payin";

const COPY: Record<
  EntryKind,
  { trigger: string; title: string; description: string; cta: string }
> = {
  drop: {
    trigger: "Add cash drop",
    title: "Add cash drop",
    description:
      "Record what you physically counted out of the drawer, not what the register reported.",
    cta: "Save drop",
  },
  payout: {
    trigger: "Payout",
    title: "Add payout",
    description: "Cash leaving the drawer. Attach the receipt before saving.",
    cta: "Save payout",
  },
  payin: {
    trigger: "Pay-in",
    title: "Add pay-in",
    description: "Cash added to the drawer. Attach the receipt before saving.",
    cta: "Save pay-in",
  },
};

export function EntryDialog({
  kind,
  variant = "default",
}: {
  kind: EntryKind;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { addDrop, addPay, submitted } = useClose();
  const copy = COPY[kind];

  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [station, setStation] = React.useState(STATIONS[0]);
  const [category, setCategory] = React.useState(PAYOUT_CATEGORIES[0]);
  const [verified, setVerified] = React.useState(true);

  function reset() {
    setAmount("");
    setStation(STATIONS[0]);
    setCategory(PAYOUT_CATEGORIES[0]);
    setVerified(true);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = toNumber(amount);
    if (value <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const cashier = MY_MANAGER + " (Mgr)";

    if (kind === "drop") {
      addDrop({
        time,
        station,
        cashier,
        amount: value,
        manager: value,
        verified,
      });
    } else {
      const type = kind === "payout" ? "Payout" : "Pay-In";
      addPay({
        type,
        time,
        station,
        cashier,
        category: kind === "payout" ? "—" : category,
        amount: value,
        manager: value,
        receipt: verified,
        verified,
      });
    }

    toast.success(copy.title.replace("Add", "Added"), {
      description: money(value) + " · " + station,
    });
    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant={variant} disabled={submitted}>
            <PlusIcon data-icon="inline-start" />
            {copy.trigger}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3">
            <div className="grid gap-2">
              <Label htmlFor="entry-amount">Amount counted by manager</Label>
              <Input
                id="entry-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="entry-station">Station</Label>
              <Select
                value={station}
                onValueChange={(value) => value && setStation(value)}
              >
                <SelectTrigger id="entry-station" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kind === "payin" && (
              <div className="grid gap-2">
                <Label htmlFor="entry-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => value && setCategory(value)}
                >
                  <SelectTrigger id="entry-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOUT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Label className="flex items-start gap-2.5 font-normal">
              <Checkbox
                checked={verified}
                onCheckedChange={(v) => setVerified(v === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                I counted this myself and attached the receipt
              </span>
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{copy.cta}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
