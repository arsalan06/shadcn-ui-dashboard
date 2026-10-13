import type { MtdDay } from "@/lib/mtd-data";

export type MtdColumnFormat = "money" | "count" | "text";

export type MtdColumnGroup =
  | "Sales"
  | "Departments"
  | "Over / short"
  | "Cash & deposit"
  | "Accumulated";

export type MtdColumn = {
  key: keyof MtdDay;
  label: string;
  format: MtdColumnFormat;
  group: MtdColumnGroup;
  /** Bolded, like a subtotal column within its group. */
  strong?: boolean;
  /** Over/short coloring: green at zero, amber positive, red negative. */
  variance?: boolean;
  /** Free-text column (a comment) — left aligned and wider than a number cell. */
  wide?: boolean;
};

export const MTD_COLUMN_GROUPS: MtdColumnGroup[] = [
  "Sales",
  "Departments",
  "Over / short",
  "Cash & deposit",
  "Accumulated",
];

export const MTD_COLUMNS: MtdColumn[] = [
  { key: "envComment", label: "White Envelope", format: "text", group: "Sales", wide: true },
  { key: "cpn", label: "CPN", format: "count", group: "Sales" },
  { key: "cc", label: "CC", format: "count", group: "Sales" },
  { key: "vpc", label: "VPC", format: "money", group: "Sales" },
  { key: "net", label: "Net sales", format: "money", group: "Sales", strong: true },
  { key: "taxes", label: "Taxes", format: "money", group: "Sales" },
  { key: "gross", label: "Gross", format: "money", group: "Sales", strong: true },
  { key: "daySales", label: "Day sales", format: "money", group: "Sales" },
  { key: "nightSales", label: "Night sales", format: "money", group: "Sales" },

  { key: "womCt", label: "Wom CT", format: "count", group: "Departments" },
  { key: "women", label: "Women", format: "money", group: "Departments" },
  { key: "kidsCt", label: "Kids CT", format: "count", group: "Departments" },
  { key: "kids", label: "Kids", format: "money", group: "Departments" },
  { key: "binsCt", label: "Bins CT", format: "count", group: "Departments" },
  { key: "bins", label: "Bins", format: "money", group: "Departments" },
  { key: "mensCt", label: "Mens CT", format: "count", group: "Departments" },
  { key: "mens", label: "Mens", format: "money", group: "Departments" },
  { key: "miscCt", label: "Misc CT", format: "count", group: "Departments" },
  { key: "misc", label: "Misc", format: "money", group: "Departments" },
  { key: "shoesCt", label: "Shoes CT", format: "count", group: "Departments" },
  { key: "shoes", label: "Shoes", format: "money", group: "Departments" },
  { key: "elecCt", label: "Elec CT", format: "count", group: "Departments" },
  { key: "electric", label: "Electric", format: "money", group: "Departments" },
  { key: "tvCt", label: "TV CT", format: "count", group: "Departments" },
  { key: "tv", label: "TV", format: "money", group: "Departments" },
  { key: "furnCt", label: "Furn CT", format: "count", group: "Departments" },
  { key: "furniture", label: "Furniture", format: "money", group: "Departments" },
  { key: "jewCt", label: "Jew CT", format: "count", group: "Departments" },
  { key: "jewelry", label: "Jewelry", format: "money", group: "Departments" },
  { key: "cpnCt", label: "Coupon CT", format: "count", group: "Departments" },
  { key: "ttCoupons", label: "TT Coupons", format: "money", group: "Departments" },

  { key: "roundUp", label: "Rounded up", format: "money", group: "Over / short" },
  { key: "roundDown", label: "Rounded down", format: "money", group: "Over / short" },
  { key: "roundTotal", label: "Rounded total", format: "money", group: "Over / short" },
  { key: "storeOs", label: "Store O/S", format: "money", group: "Over / short", variance: true },
  { key: "regOs", label: "Register O/S", format: "money", group: "Over / short", variance: true },
  { key: "bankOs", label: "Bank O/S", format: "money", group: "Over / short", variance: true },
  { key: "payinOs", label: "Pay-in O/S", format: "money", group: "Over / short", variance: true },
  { key: "note", label: "Over/short comment", format: "text", group: "Over / short", wide: true },

  { key: "cash", label: "Cash", format: "money", group: "Cash & deposit" },
  { key: "checks", label: "Checks", format: "money", group: "Cash & deposit" },
  { key: "deposit", label: "Deposit", format: "money", group: "Cash & deposit", strong: true },
  { key: "credit", label: "Credit", format: "money", group: "Cash & deposit" },
  { key: "payouts", label: "Payouts", format: "money", group: "Cash & deposit" },
  { key: "payoutNote", label: "Payout comments", format: "text", group: "Cash & deposit", wide: true },
  { key: "payin", label: "Pay-in", format: "money", group: "Cash & deposit" },

  { key: "weekly", label: "Weekly accum", format: "money", group: "Accumulated" },
  { key: "monthly", label: "Monthly accum", format: "money", group: "Accumulated" },
  { key: "ladiesOut", label: "Ladie's out", format: "count", group: "Accumulated" },
  { key: "mensOut", label: "Men's out", format: "count", group: "Accumulated" },
  { key: "kidsOut", label: "Kid's out", format: "count", group: "Accumulated" },
];

/** Columns that don't add up across a month — a running balance or a
 * per-transaction average would be meaningless summed, so the MTD row
 * leaves these blank rather than showing a misleading number. */
const NO_TOTAL: Partial<Record<keyof MtdDay, true>> = {
  vpc: true,
  envComment: true,
  note: true,
  payoutNote: true,
  weekly: true,
  monthly: true,
};

export function columnHasTotal(column: MtdColumn): boolean {
  return !NO_TOTAL[column.key];
}
