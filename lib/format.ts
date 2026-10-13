/** Anything below half a cent is a rounding artefact, not a variance. */
export const CENT = 0.005;

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `$1,234.56` / `-$1,234.56` — the sign leads the symbol, as on a register tape. */
export function money(n: number): string {
  const safe = Number.isFinite(n) ? n : 0;
  return (safe < -CENT ? "-$" : "$") + currency.format(Math.abs(safe));
}

/** Same, but a positive variance keeps its `+` so the sign is never inferred. */
export function signedMoney(n: number): string {
  if (Math.abs(n) < CENT) return money(0);
  return (n > 0 ? "+" : "") + money(n);
}

export function isBalanced(n: number): boolean {
  return Math.abs(n) < CENT;
}

export function count(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** `2026-09-15` → `09/15/2026`, the form the stores and the register tape use. */
export function usDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return m && d ? m + "/" + d + "/" + y : iso;
}

export function toNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
