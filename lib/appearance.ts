export const APPEARANCE_STORAGE_KEY = "citadel-appearance";

export const PRESET_COLORS = [
  { name: "Citadel Red", value: "#be1d2c" },
  { name: "Blue", value: "#2563eb" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Emerald", value: "#059669" },
  { name: "Amber", value: "#d97706" },
  { name: "Slate", value: "#475569" },
] as const;

export const FONT_OPTIONS = [
  { key: "jakarta", label: "Plus Jakarta Sans" },
  { key: "inter", label: "Inter" },
  { key: "manrope", label: "Manrope" },
  { key: "outfit", label: "Outfit" },
] as const;

export type FontKey = (typeof FONT_OPTIONS)[number]["key"];

export const DEFAULT_PRIMARY_COLOR: string = PRESET_COLORS[0].value;
export const DEFAULT_FONT_KEY: FontKey = FONT_OPTIONS[0].key;

export type AppearanceSettings = {
  color: string;
  font: FontKey;
};
