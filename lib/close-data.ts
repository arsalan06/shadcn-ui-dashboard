/**
 * Seed data for the 09/10–09/15/2026 close cycle.
 *
 * In production these shapes are what the register export and the corporate
 * ledger hand back; they are kept in one place so the UI never invents a number
 * and the same figures drive both the corporate rollup and the envelope.
 */

export type StoreClose = {
  store: string;
  num: string;
  /** What the register reported. */
  system: number;
  /** What the manager physically counted. `0` means no envelope submitted yet. */
  manager: number;
  /** What the bank posted. `0` means the deposit has not cleared yet. */
  bank: number;
  /**
   * White-envelope comments as the service returns them. Absent on the seed
   * data, which has no comments to carry.
   */
  comments?: string | null;
};

export type CashDrop = {
  id: string;
  time: string;
  station: string;
  cashier: string;
  /** Register-reported amount. */
  amount: number;
  /** Manager-counted amount. */
  manager: number;
  verified: boolean;
};

export type PayEntry = {
  id: string;
  type: "Payout" | "Pay-In";
  time: string;
  station: string;
  cashier: string;
  category: string;
  amount: number;
  manager: number;
  receipt: boolean;
  verified: boolean;
};

export type CardCharge = {
  id: string;
  time: string;
  station: string;
  invoice: string;
  amount: number;
};

export type ActivityKind = "Checkout" | "Reopen" | "Comment";

export type ActivityEntry = {
  id: string;
  /**
   * The service's own sentence for the event. When present it is rendered
   * verbatim, because the log carries no separate actor, store, IP or kind —
   * the fields below exist only for the seed data.
   */
  description?: string;
  who: string;
  store: string;
  /** The close date the entry acted on, `MM/DD/YYYY`. */
  date: string;
  ip: string;
  /** When it happened, `MM/DD/YYYY HH:MM AM`. */
  at: string;
  kind: ActivityKind;
};

export type DenomKey = "d100" | "d50" | "d20" | "d10" | "d5" | "d1" | "coin";

export type Denomination = {
  key: DenomKey;
  label: string;
  /** Multiplier applied to the entered count. Coin is entered as a dollar total. */
  unit: number;
};

export const DENOMINATIONS: Denomination[] = [
  { key: "d100", label: "$100 bills", unit: 100 },
  { key: "d50", label: "$50 bills", unit: 50 },
  { key: "d20", label: "$20 bills", unit: 20 },
  { key: "d10", label: "$10 bills", unit: 10 },
  { key: "d5", label: "$5 bills", unit: 5 },
  { key: "d1", label: "$1 bills", unit: 1 },
  { key: "coin", label: "Coin (total $)", unit: 1 },
];

export type PieceKey = "carts" | "mens" | "ladies" | "kids" | "box";

export const PIECE_COUNTS: { key: PieceKey; label: string }[] = [
  { key: "carts", label: "Number of Carts" },
  { key: "mens", label: "Number of Mens Pieces" },
  { key: "ladies", label: "Number of Ladies Pieces" },
  { key: "kids", label: "Number of Kids Pieces" },
  { key: "box", label: "Number of Box Pieces" },
];

export type CheckKey = "camera" | "production";

export const STORE_CHECKS: { key: CheckKey; label: string; done: string }[] = [
  { key: "camera", label: "Camera Checked (Y N)", done: "Check" },
  { key: "production", label: "Production number", done: "Available" },
];

export const STATIONS = [
  "POS-AIO-TouchDynamics",
  "Register 25646",
  "Back office safe",
];

export const PAYOUT_CATEGORIES = [
  "CLEANING & MAINTENANCE",
  "SUPPLIES",
  "PETTY CASH",
  "DONATION PICKUP",
];

/** The store this session's manager is closing. */
export const MY_STORE_NUM = "256";
export const MY_STORE_LABEL = "Training Store (256)";
export const MY_MANAGER = "Arsalan Qadir";
export const CLOSE_DATE = "2026-09-10";
export const CORPORATE_DATE = "2026-09-15";

/** Register-reported cash expected in the drawer for the envelope's date. */
export const EXPECTED_CASH = 19.1;

export const STORES: StoreClose[] = [
  { store: "Fulton", num: "011", system: 4513.34, manager: 0, bank: 0 },
  { store: "Bell", num: "021", system: 10527.53, manager: 10527.53, bank: 10527.53 },
  { store: "LYork", num: "023", system: 6386.1, manager: 6386.6, bank: 6386.6 },
  { store: "Long Point", num: "024", system: 7050.56, manager: 7050.61, bank: 7050.61 },
  { store: "Uvalde", num: "025", system: 7130.9, manager: 7130.75, bank: 7130.25 },
  { store: "LYO Womens", num: "026", system: 7185.0, manager: 7184.95, bank: 0 },
  { store: "Corpus", num: "027", system: 5936.8, manager: 5938.3, bank: 5938.3 },
  { store: "Bandera", num: "029", system: 6537.2, manager: 6537.2, bank: 6537.2 },
  { store: "Wayside", num: "034", system: 9318.19, manager: 0, bank: 0 },
  { store: "Lake June", num: "035", system: 8001.23, manager: 8003.53, bank: 8003.53 },
  { store: "Southmore", num: "037", system: 6588.98, manager: 6589.63, bank: 0 },
  { store: "Garland", num: "038", system: 6132.08, manager: 0, bank: 0 },
  { store: "Hwy6", num: "041", system: 6346.33, manager: 6348.43, bank: 6348.93 },
  { store: "Brownsville", num: "042", system: 7261.97, manager: 7263.37, bank: 0 },
  { store: "FWO", num: "044", system: 5542.98, manager: 5344.68, bank: 5344.68 },
  { store: "RBO", num: "051", system: 4773.51, manager: 0, bank: 0 },
  { store: "I10", num: "055", system: 6673.26, manager: 6673.61, bank: 0 },
  { store: "Willowbrook", num: "058", system: 6426.31, manager: 6427.66, bank: 6427.66 },
  { store: "Almeda", num: "060", system: 3936.26, manager: 0, bank: 0 },
  { store: "Hulen", num: "132", system: 5274.73, manager: 5275.08, bank: 0 },
  { store: "529", num: "143", system: 6698.51, manager: 6697.96, bank: 6697.96 },
  { store: "Training Store", num: MY_STORE_NUM, system: 0, manager: 0, bank: 0 },
];

export const INITIAL_DROPS: CashDrop[] = [
  {
    id: "drop-1",
    time: "2:37 AM",
    station: "POS-AIO-TouchDynamics",
    cashier: "Ava Thompson (RMS)",
    amount: 300,
    manager: 300,
    verified: true,
  },
];

export const INITIAL_PAYS: PayEntry[] = [
  {
    id: "pay-1",
    type: "Payout",
    time: "10:11 AM",
    station: "Register 25646",
    cashier: "Liam Chen",
    category: "—",
    amount: 10,
    manager: 10,
    receipt: true,
    verified: true,
  },
  {
    id: "pay-2",
    type: "Pay-In",
    time: "10:12 AM",
    station: "POS-AIO-TouchDynamics",
    cashier: "Noah Patel",
    category: "CLEANING & MAINTENANCE",
    amount: 2,
    manager: 2,
    receipt: false,
    verified: true,
  },
];

/** The register pulled a zero card batch for 09/10 — the empty state is real. */
export const INITIAL_CHARGES: CardCharge[] = [];

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: "act-1",
    who: "Angeles Pineda",
    store: "LYork (023)",
    date: "09/15/2026",
    ip: "74.95.252.133",
    at: "09/16/2026 07:55 AM",
    kind: "Checkout",
  },
  {
    id: "act-2",
    who: "Nancy Sanchez",
    store: "Lake June (035)",
    date: "09/15/2026",
    ip: "71.41.198.122",
    at: "09/16/2026 07:50 AM",
    kind: "Checkout",
  },
  {
    id: "act-3",
    who: "Mindy Espio",
    store: "Hulen (132)",
    date: "09/15/2026",
    ip: "24.182.193.146",
    at: "09/16/2026 07:45 AM",
    kind: "Checkout",
  },
  {
    id: "act-4",
    who: "Corporate office",
    store: "Wayside (034)",
    date: "09/15/2026",
    ip: "72.181.44.20",
    at: "09/16/2026 07:31 AM",
    kind: "Comment",
  },
  {
    id: "act-5",
    who: "Raul Medina",
    store: "Bell (021)",
    date: "09/14/2026",
    ip: "70.121.88.14",
    at: "09/15/2026 08:12 AM",
    kind: "Checkout",
  },
  {
    id: "act-6",
    who: "Corporate office",
    store: "Garland (038)",
    date: "09/14/2026",
    ip: "72.181.44.20",
    at: "09/15/2026 07:58 AM",
    kind: "Reopen",
  },
  {
    id: "act-7",
    who: "Tanya Brooks",
    store: "Willowbrook (058)",
    date: "09/14/2026",
    ip: "68.203.14.77",
    at: "09/15/2026 07:41 AM",
    kind: "Checkout",
  },
  {
    id: "act-8",
    who: "Hector Salinas",
    store: "Brownsville (042)",
    date: "09/13/2026",
    ip: "107.77.203.18",
    at: "09/14/2026 08:04 AM",
    kind: "Checkout",
  },
];
