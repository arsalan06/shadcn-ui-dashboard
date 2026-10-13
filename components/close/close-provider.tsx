"use client";

import * as React from "react";
import {
  CLOSE_DATE,
  DENOMINATIONS,
  EXPECTED_CASH,
  INITIAL_ACTIVITY,
  INITIAL_CHARGES,
  INITIAL_DROPS,
  INITIAL_PAYS,
  MY_MANAGER,
  MY_STORE_LABEL,
  MY_STORE_NUM,
  STORES,
  type ActivityEntry,
  type CardCharge,
  type CashDrop,
  type CheckKey,
  type DenomKey,
  type PayEntry,
  type PieceKey,
  type StoreClose,
} from "@/lib/close-data";
import { isBalanced, money, usDate } from "@/lib/format";

export const STEPS = [
  { key: "drops", label: "Cash drops", href: "/envelope/drops" },
  { key: "payouts", label: "Payouts & pay-ins", href: "/envelope/payouts" },
  { key: "charges", label: "Credit card charges", href: "/envelope/charges" },
  { key: "checkout", label: "Check out", href: "/envelope/checkout" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export type StoreBucket = "Submitted" | "Variance" | "Missing";

/**
 * How far a store has travelled through the close, independent of whether its
 * numbers agree: the register reports, the manager counts, the bank posts.
 * A store can be balanced and still be mid-flight, so stage and variance are
 * reported as separate columns rather than folded into one status.
 */
export type StoreStage =
  | "Deposited"
  | "Counted"
  | "Awaiting store"
  | "No sales";

export type StoreRow = StoreClose & {
  label: string;
  isMine: boolean;
  /** No envelope has been checked out for this store yet. */
  missing: boolean;
  /** Manager count minus system total. Positive is over, negative is short. */
  variance: number;
  /** Bank posting minus manager count, once the deposit has cleared. */
  bankVariance: number;
  bucket: StoreBucket;
  stage: StoreStage;
  statusLabel: string;
  stageLabel: string;
};

export type Issue = {
  id: string;
  step: StepKey;
  stepLabel: string;
  text: string;
};

type Denoms = Record<DenomKey, number>;
type Pieces = Record<PieceKey, number>;
type Checks = Record<CheckKey, boolean>;

type CloseContextValue = {
  // --- raw state -----------------------------------------------------------
  expectedCash: number;
  drops: CashDrop[];
  pays: PayEntry[];
  charges: CardCharge[];
  denoms: Denoms;
  pieces: Pieces;
  checks: Checks;
  note: string;
  activity: ActivityEntry[];
  submitted: boolean;
  submittedAt: string;

  // --- derived -------------------------------------------------------------
  /** Sum of the manager's denomination counts. */
  countedCash: number;
  /** Manager-counted drops, verified entries only. */
  dropsVerifiedTotal: number;
  dropsSystemTotal: number;
  payouts: PayEntry[];
  payins: PayEntry[];
  payoutTotal: number;
  payinTotal: number;
  /** Counted cash minus what the register expected. The headline variance. */
  overShort: number;
  storeRows: StoreRow[];
  /** The close date the board is showing, `YYYY-MM-DD`. Defaults to today. */
  closeDate: string;
  setCloseDate: (date: string) => void;
  /** True while the rollup for `closeDate` is in flight. */
  storesLoading: boolean;
  /** Set when the report could not be loaded at all. */
  storesError: string | null;
  issues: Issue[];

  // --- actions -------------------------------------------------------------
  addDrop: (entry: Omit<CashDrop, "id">) => void;
  addPay: (entry: Omit<PayEntry, "id">) => void;
  toggleDrop: (id: string) => void;
  togglePay: (id: string) => void;
  setDenom: (key: DenomKey, value: number) => void;
  setPiece: (key: PieceKey, value: number) => void;
  toggleCheck: (key: CheckKey) => void;
  setNote: (value: string) => void;
  submit: () => string;
  reopen: () => void;
};

const CloseContext = React.createContext<CloseContextValue | null>(null);

const INITIAL_DENOMS: Denoms = {
  d100: 2,
  d50: 1,
  d20: 2,
  d10: 0,
  d5: 2,
  d1: 0,
  coin: 0,
};

const INITIAL_PIECES: Pieces = {
  carts: 10,
  mens: 10,
  ladies: 14,
  kids: 10,
  box: 1,
};

const INITIAL_CHECKS: Checks = { camera: true, production: false };

const stepLabel = (key: StepKey) =>
  STEPS.find((s) => s.key === key)?.label ?? key;

/** Today in the browser's own timezone, as `YYYY-MM-DD`. */
function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function CloseProvider({ children }: { children: React.ReactNode }) {
  // The board opens on today and refetches whenever the date changes.
  const [closeDate, setCloseDate] = React.useState(today);
  const [fetchedStores, setFetchedStores] = React.useState<StoreClose[] | null>(
    null,
  );
  const [storesLoading, setStoresLoading] = React.useState(true);
  const [storesError, setStoresError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    setStoresLoading(true);
    setStoresError(null);

    fetch(`/api/close?date=${closeDate}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.ok) throw new Error(body.message ?? "Report failed");
        setFetchedStores(body.stores as StoreClose[]);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setFetchedStores(null);
        setStoresError(
          error instanceof Error ? error.message : "Could not load the report.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setStoresLoading(false);
      });

    return () => controller.abort();
  }, [closeDate]);

  // Seed data only stands in when the report could not be loaded at all.
  const storeSource = fetchedStores ?? (storesError ? STORES : []);
  const [drops, setDrops] = React.useState<CashDrop[]>(INITIAL_DROPS);
  const [pays, setPays] = React.useState<PayEntry[]>(INITIAL_PAYS);
  const [charges] = React.useState<CardCharge[]>(INITIAL_CHARGES);
  const [denoms, setDenoms] = React.useState<Denoms>(INITIAL_DENOMS);
  const [pieces, setPieces] = React.useState<Pieces>(INITIAL_PIECES);
  const [checks, setChecks] = React.useState<Checks>(INITIAL_CHECKS);
  const [note, setNote] = React.useState("");
  const [activity, setActivity] =
    React.useState<ActivityEntry[]>(INITIAL_ACTIVITY);

  // Real log entries replace the seed data once they arrive. The service
  // returns only a sentence and a timestamp, so the richer seed fields are
  // left blank rather than invented.
  React.useEffect(() => {
    const controller = new AbortController();

    fetch("/api/activity", { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.ok) throw new Error(body.message ?? "Log failed");
        return body.entries as {
          id: string;
          description: string;
          at: string | null;
        }[];
      })
      .then((entries) => {
        setActivity(
          entries.map((e) => ({
            id: e.id,
            description: e.description,
            who: "",
            store: "",
            date: "",
            ip: "",
            at: e.at ?? "",
            kind: "Comment" as const,
          })),
        );
      })
      .catch(() => {
        // Leave the seed entries in place; the drawer stays usable.
      });

    return () => controller.abort();
  }, []);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedAt, setSubmittedAt] = React.useState("");

  const countedCash = React.useMemo(
    () =>
      DENOMINATIONS.reduce(
        (sum, d) => sum + (Number(denoms[d.key]) || 0) * d.unit,
        0,
      ),
    [denoms],
  );

  const dropsVerifiedTotal = React.useMemo(
    () => drops.reduce((sum, d) => sum + (d.verified ? d.manager : 0), 0),
    [drops],
  );
  const dropsSystemTotal = React.useMemo(
    () => drops.reduce((sum, d) => sum + d.amount, 0),
    [drops],
  );

  const payouts = React.useMemo(
    () => pays.filter((p) => p.type === "Payout"),
    [pays],
  );
  const payins = React.useMemo(
    () => pays.filter((p) => p.type === "Pay-In"),
    [pays],
  );
  const payoutTotal = React.useMemo(
    () => payouts.reduce((sum, p) => sum + (p.verified ? p.manager : 0), 0),
    [payouts],
  );
  const payinTotal = React.useMemo(
    () => payins.reduce((sum, p) => sum + (p.verified ? p.manager : 0), 0),
    [payins],
  );

  const overShort = countedCash - EXPECTED_CASH;

  const storeRows = React.useMemo<StoreRow[]>(
    () =>
      storeSource.map((s) => {
        const mine = s.num === MY_STORE_NUM;
        // Once this store's envelope is checked out, its row reflects the
        // manager's live count rather than the placeholder zeroes.
        const system = mine && submitted ? EXPECTED_CASH : s.system;
        const manager = mine && submitted ? countedCash : s.manager;
        const missing = manager === 0 && !(mine && submitted);
        const variance = missing ? 0 : manager - system;
        const bankVariance = s.bank === 0 ? 0 : s.bank - manager;

        let bucket: StoreBucket = "Submitted";
        let statusLabel = "Balanced";
        if (missing) {
          bucket = "Missing";
          statusLabel = "No envelope submitted";
        } else if (!isBalanced(variance)) {
          const direction = variance > 0 ? "over" : "short";
          bucket = "Variance";
          statusLabel =
            "Manager is " + direction + " by " + money(Math.abs(variance));
        }

        let stage: StoreStage = "No sales";
        let stageLabel = "No system sales reported for this date";
        if (s.bank > 0) {
          stage = "Deposited";
          stageLabel = "Envelope submitted and bank deposit confirmed";
        } else if (!missing) {
          stage = "Counted";
          stageLabel =
            "Manager counted and envelope submitted — bank deposit not yet posted";
        } else if (system > 0) {
          stage = "Awaiting store";
          stageLabel =
            "System sales only — the store has not submitted a white envelope";
        }

        return {
          ...s,
          system,
          manager,
          label: s.store + " (" + s.num + ")",
          isMine: mine,
          missing,
          variance,
          bankVariance,
          bucket,
          stage,
          statusLabel,
          stageLabel,
        };
      }),
    [countedCash, submitted, storeSource],
  );

  // Issues are derived, never hard-coded: resolving one in the UI clears it.
  const issues = React.useMemo<Issue[]>(() => {
    const list: Issue[] = [];

    if (!isBalanced(overShort)) {
      list.push({
        id: "variance",
        step: "checkout",
        stepLabel: stepLabel("checkout"),
        text:
          "Manager count is " +
          money(Math.abs(overShort)) +
          (overShort > 0 ? " over" : " under") +
          " the expected drawer amount.",
      });
    }

    for (const p of pays) {
      if (!p.receipt) {
        list.push({
          id: "receipt-" + p.id,
          step: "payouts",
          stepLabel: stepLabel("payouts"),
          text:
            p.type +
            " at " +
            p.time +
            " (" +
            p.cashier +
            ") has no receipt image attached.",
        });
      }
    }

    if (charges.length === 0) {
      list.push({
        id: "no-batch",
        step: "charges",
        stepLabel: stepLabel("charges"),
        text: "No card batch was pulled from the register for 09/10.",
      });
    }

    if (!checks.production) {
      list.push({
        id: "production",
        step: "checkout",
        stepLabel: stepLabel("checkout"),
        text: "Production number has not been posted yet.",
      });
    }

    if (!isBalanced(overShort) && note.trim() === "") {
      list.push({
        id: "variance-note",
        step: "checkout",
        stepLabel: stepLabel("checkout"),
        text: "Corporate office is waiting on a variance explanation.",
      });
    }

    return list;
  }, [charges.length, checks.production, note, overShort, pays]);

  const value = React.useMemo<CloseContextValue>(() => {
    const addDrop: CloseContextValue["addDrop"] = (entry) =>
      setDrops((prev) => [
        ...prev,
        { ...entry, id: "drop-" + (prev.length + 1) + "-" + Date.now() },
      ]);

    const addPay: CloseContextValue["addPay"] = (entry) =>
      setPays((prev) => [
        ...prev,
        { ...entry, id: "pay-" + (prev.length + 1) + "-" + Date.now() },
      ]);

    const submit = () => {
      const at =
        "09/16/2026 " +
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      setSubmitted(true);
      setSubmittedAt(at);
      setActivity((prev) => [
        {
          id: "act-" + Date.now(),
          who: MY_MANAGER,
          store: MY_STORE_LABEL,
          date: usDate(CLOSE_DATE),
          ip: "72.181.44.20",
          at,
          kind: "Checkout",
        },
        ...prev,
      ]);
      return at;
    };

    const reopen = () => {
      setSubmitted(false);
      setActivity((prev) => [
        {
          id: "act-" + Date.now(),
          who: MY_MANAGER,
          store: MY_STORE_LABEL,
          date: usDate(CLOSE_DATE),
          ip: "72.181.44.20",
          at: submittedAt,
          kind: "Reopen",
        },
        ...prev,
      ]);
    };

    return {
      expectedCash: EXPECTED_CASH,
      drops,
      pays,
      charges,
      denoms,
      pieces,
      checks,
      note,
      activity,
      submitted,
      submittedAt,

      countedCash,
      dropsVerifiedTotal,
      dropsSystemTotal,
      payouts,
      payins,
      payoutTotal,
      payinTotal,
      overShort,
      storeRows,
      closeDate,
      setCloseDate,
      storesLoading,
      storesError,
      issues,

      addDrop,
      addPay,
      toggleDrop: (id) =>
        setDrops((prev) =>
          prev.map((d) => (d.id === id ? { ...d, verified: !d.verified } : d)),
        ),
      togglePay: (id) =>
        setPays((prev) =>
          prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p)),
        ),
      setDenom: (key, v) =>
        setDenoms((prev) => ({ ...prev, [key]: Math.max(0, v) })),
      setPiece: (key, v) =>
        setPieces((prev) => ({ ...prev, [key]: Math.max(0, v) })),
      toggleCheck: (key) =>
        setChecks((prev) => ({ ...prev, [key]: !prev[key] })),
      setNote,
      submit,
      reopen,
    };
  }, [
    activity,
    charges,
    checks,
    countedCash,
    denoms,
    drops,
    dropsSystemTotal,
    dropsVerifiedTotal,
    issues,
    note,
    overShort,
    payinTotal,
    payins,
    payoutTotal,
    payouts,
    pays,
    pieces,
    storeRows,
    closeDate,
    storesLoading,
    storesError,
    submitted,
    submittedAt,
  ]);

  return <CloseContext.Provider value={value}>{children}</CloseContext.Provider>;
}

export function useClose(): CloseContextValue {
  const ctx = React.useContext(CloseContext);
  if (!ctx) throw new Error("useClose must be used inside <CloseProvider>");
  return ctx;
}
