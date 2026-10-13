import "server-only";
import type { StoreClose } from "@/lib/close-data";

/**
 * Read-only client for the corporate daily-close board.
 *
 * The board is backed by GetDAStoreTotals on the WCF service's
 * DailyAutomation endpoint — the same call the current app makes behind its
 * `get_daily_sales_store_total` route. One request returns every store the
 * user can see, already carrying the system / manager / bank figures.
 *
 * READ-ONLY by policy. The neighbouring operations on this endpoint
 * (SaveWhiteEnvelopeCheckout, UpdateManagerDeposit, UpdateBankDeposit,
 * UpdateMTDComment) write, and none of them belong in this file.
 */

const BASE = process.env.CITADEL_DAILY_AUTOMATION_URL;

if (!BASE) {
  throw new Error(
    "CITADEL_DAILY_AUTOMATION_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
}

/** A store is flagged this way when no envelope has been submitted yet. */
export const MISSING_WHITE_ENVELOPE = "MISSING_WHITE_ENVELOPE";

/**
 * WCF serialises dates as `/Date(1739776808793-0600)/`, which neither
 * `new Date()` nor dayjs parses.
 */
function parseWcfDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /\/Date\((-?\d+)([+-]\d{4})?\)\//.exec(value);
  if (!match) {
    const direct = new Date(value);
    return Number.isNaN(direct.getTime()) ? null : direct;
  }
  const ms = Number(match[1]);
  return Number.isFinite(ms) ? new Date(ms) : null;
}

type DAStoreTotalsRow = {
  DAStoreTotals: {
    SystemTotal: number | null;
    ManagerDeposit: number | null;
    BankDeposit: number | null;
    StoreTotalsStatus: string | null;
    Comments: string | null;
    StoreInFo: { locationid: string; name: string } | null;
  } | null;
};

/**
 * The upstream wants `Y-m-d h:i a`, which is what the PHP client builds with
 * `date('Y-m-d h:i a', strtotime($date))`. A plain ISO date is not accepted.
 */
function toServiceDate(date: string) {
  return `${date} 12:00 am`;
}

export async function getCorporateClose(
  userId: string,
  date: string,
): Promise<StoreClose[]> {
  // The report can be slow and a page cannot wait indefinitely; the old PHP
  // client allowed 15 minutes, which is not a budget a request can hold.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(`${BASE}GetDAStoreTotals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        storeId: null, // null = every store this user is entitled to
        date: toServiceDate(date),
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`GetDAStoreTotals responded ${res.status}`);

    const text = await res.text();
    let json: { GetDAStoreTotalsResult?: DAStoreTotalsRow[] };
    try {
      json = JSON.parse(text);
    } catch {
      // The service answers errors with an html page. The PHP client turned
      // that into null and showed it as "no data", which hides real faults.
      throw new Error("GetDAStoreTotals returned a non-JSON body");
    }

    return (json.GetDAStoreTotalsResult ?? []).flatMap((row) => {
      const t = row?.DAStoreTotals;
      const info = t?.StoreInFo;
      if (!t || !info?.locationid) return [];

      return [
        {
          store: info.name ?? info.locationid,
          num: info.locationid,
          system: t.SystemTotal ?? 0,
          // A store with no envelope reports zeroes, which the board already
          // renders as "Awaiting store".
          manager: t.ManagerDeposit ?? 0,
          bank: t.BankDeposit ?? 0,
          // The service sends "" as often as null for "no comment".
          comments: t.Comments?.trim() || null,
        } satisfies StoreClose,
      ];
    });
  } finally {
    clearTimeout(timeout);
  }
}

/* -------------------------------------------------------------------------
 * Activity log
 * ---------------------------------------------------------------------- */

export type ActivityLogEntry = {
  id: string;
  /** The service's own sentence, shown verbatim. */
  description: string;
  /** ISO timestamp, or null when the service sent no date. */
  at: string | null;
};

type DailyAutomationLogRow = {
  Description: string | null;
  Created: string | null;
};

/**
 * The daily automation log for the signed-in user.
 *
 * The service returns only `Description` and `Created` — there is no separate
 * actor, store, IP or event type, so none is invented here. The old app
 * rendered exactly these two fields too.
 */
export async function getActivityLog(
  userId: string,
): Promise<ActivityLogEntry[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(
      `${BASE}get_daily_automation_logs?userid=${encodeURIComponent(userId)}`,
      { headers: { Accept: "application/json" }, cache: "no-store", signal: controller.signal },
    );

    if (!res.ok) throw new Error(`get_daily_automation_logs responded ${res.status}`);

    const text = await res.text();
    let rows: DailyAutomationLogRow[];
    try {
      rows = JSON.parse(text);
    } catch {
      throw new Error("get_daily_automation_logs returned a non-JSON body");
    }

    return (Array.isArray(rows) ? rows : []).flatMap((row, i) => {
      const description = row?.Description?.trim();
      if (!description) return [];
      const at = parseWcfDate(row.Created);
      return [
        {
          id: `log-${i}-${at?.getTime() ?? i}`,
          description,
          at: at ? at.toISOString() : null,
        } satisfies ActivityLogEntry,
      ];
    });
  } finally {
    clearTimeout(timeout);
  }
}
