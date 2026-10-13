/** Seed data for the corporate Reports browser — one illustrative dataset
 * ("Store Overview Report") shown regardless of which report name is picked,
 * matching the rest of this prototype's unwired "Show"/"Send" actions. */

export type ReportGroup = {
  group: string;
  items: string[];
};

export const REPORT_GROUPS: ReportGroup[] = [
  {
    group: "Daily",
    items: [
      "Store Overview Report",
      "Daily Sales Report",
      "Daily Money For System Report V2",
      "Daily Store Report",
      "Z Reading Report",
      "Cash Drawer Report",
    ],
  },
  {
    group: "Sales",
    items: [
      "Department Report",
      "Tender Report",
      "Hourly Sales Report",
      "Coupon Sales Report",
      "Coupon Summary Report",
      "Discount Report",
      "Loyalty Report",
    ],
  },
  {
    group: "Cashier",
    items: [
      "Cashier Report",
      "Cashier Over Short Report",
      "Override Log",
      "Voids Report",
      "Returns Report",
    ],
  },
  {
    group: "Credit card",
    items: [
      "Credit Card Sales Detail",
      "Credit Card Sales Summary",
      "Credit Card Receipt",
      "EMV Cards Report",
    ],
  },
  {
    group: "Periodic",
    items: [
      "Weekly Report",
      "Monthly Report",
      "Month to Date Report",
      "Week Ending Report",
      "Week Ending Outlet Report",
    ],
  },
  {
    group: "Other",
    items: [
      "CIS Statistics Report",
      "Zip codes Report",
      "Campaign and Promotion Report",
      "Penny Handling Report",
    ],
  },
];

export function slugifyReport(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const ALL_REPORTS: string[] = REPORT_GROUPS.flatMap((g) => g.items);

export const DEFAULT_REPORT_ID = slugifyReport("Store Overview Report");

export type ReportRow = {
  store: string;
  salesTotal: number;
  cc: number;
  vpc: number;
  items: number;
  valuePerItem: number;
  discOther: number;
  wtd: number;
  vpnlc: number;
  vplc: number;
};

export const REPORT_ROWS: ReportRow[] = [
  { store: "249", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 0, vpnlc: 0, vplc: 0 },
  { store: "Bell", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 37163, vpnlc: 14.07, vplc: 42.09 },
  { store: "I10", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 24550, vpnlc: 14.6, vplc: 35.3 },
  { store: "Willowbrook", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 22789, vpnlc: 10.32, vplc: 39.34 },
  { store: "Deerbrook", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 28376, vpnlc: 13.75, vplc: 37.22 },
  { store: "Almeda", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 20034, vpnlc: 9.99, vplc: 35.9 },
  { store: "Hulen", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 20184, vpnlc: 16.94, vplc: 36.34 },
  { store: "RBO", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 19778, vpnlc: 14.99, vplc: 0 },
  { store: "LYO Womens", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 29293, vpnlc: 16.34, vplc: 0 },
  { store: "FWO", salesTotal: 0, cc: 0, vpc: 0, items: 0, valuePerItem: 0, discOther: 0, wtd: 31784, vpnlc: 10.6, vplc: 0 },
];

export const REPORT_TOTALS: Omit<ReportRow, "store"> = {
  salesTotal: REPORT_ROWS.reduce((s, r) => s + r.salesTotal, 0),
  cc: REPORT_ROWS.reduce((s, r) => s + r.cc, 0),
  vpc: 0,
  items: REPORT_ROWS.reduce((s, r) => s + r.items, 0),
  valuePerItem: 0,
  discOther: REPORT_ROWS.reduce((s, r) => s + r.discOther, 0),
  wtd: REPORT_ROWS.reduce((s, r) => s + r.wtd, 0),
  vpnlc: 12.38,
  vplc: 36.72,
};

export const REPORT_FORMULAS: { term: string; meaning: string }[] = [
  { term: "Sales Totals", meaning: "Actual dollars coming through the system." },
  { term: "CC", meaning: "Total Customer Count" },
  { term: "VPC", meaning: "Sales Totals / Customer Count" },
  { term: "# Items", meaning: "Total number of items sold." },
  { term: "Value Per Item", meaning: "Total Store Sales / # Items Sold" },
  {
    term: "Total Disc Other",
    meaning: "Dollars saved by customers outside of the loyalty program.",
  },
  { term: "WTD", meaning: "Accumulated total for Monday - Sunday" },
  {
    term: "VPNLC",
    meaning: "Value Per Non-Loyalty Customer for Monday - Saturday",
  },
  {
    term: "VPLC",
    meaning: "Value Per Loyalty Customer for Monday - Saturday",
  },
];
