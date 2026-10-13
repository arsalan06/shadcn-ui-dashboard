"use client";

import * as React from "react";
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_FONT_KEY,
  DEFAULT_PRIMARY_COLOR,
  type AppearanceSettings,
  type FontKey,
} from "@/lib/appearance";

type AppearanceContextValue = {
  color: string;
  font: FontKey;
  setColor: (color: string) => void;
  setFont: (font: FontKey) => void;
  reset: () => void;
};

const AppearanceContext = React.createContext<AppearanceContextValue | null>(
  null,
);

function applyAppearance(settings: AppearanceSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", settings.color);
  root.style.setProperty("--ring", settings.color);
  // The left nav's selected-item highlight and logo badge are their own
  // brand tokens (kept apart from the neutral theme scale so the sidebar's
  // navy field doesn't re-theme with light/dark) — follow the picked color
  // here so "primary color" reads as one setting across the whole app.
  root.style.setProperty("--sidebar-primary", settings.color);
  root.style.setProperty("--sidebar-accent", settings.color);
  root.setAttribute("data-font", settings.font);
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  color: DEFAULT_PRIMARY_COLOR,
  font: DEFAULT_FONT_KEY,
};

/**
 * Reads localStorage synchronously as a lazy `useState` initializer rather
 * than syncing it in from an effect, which would cascade an extra render.
 * On the server this returns the defaults; the provider renders no DOM of
 * its own, so a client-only first-render correction here doesn't produce a
 * hydration mismatch — only the (closed-by-default) panel reads this state.
 */
function readStoredAppearance(): AppearanceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw) as Partial<AppearanceSettings>;
    return {
      color: saved.color ?? DEFAULT_PRIMARY_COLOR,
      font: saved.font ?? DEFAULT_FONT_KEY,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [color, setColorState] = React.useState(
    () => readStoredAppearance().color,
  );
  const [font, setFontState] = React.useState<FontKey>(
    () => readStoredAppearance().font,
  );

  const persist = React.useCallback((next: AppearanceSettings) => {
    applyAppearance(next);
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be unavailable (private browsing, quota) — the
      // appearance still applies for this session, it just won't persist.
    }
  }, []);

  const setColor = React.useCallback(
    (next: string) => {
      setColorState(next);
      persist({ color: next, font });
    },
    [font, persist],
  );

  const setFont = React.useCallback(
    (next: FontKey) => {
      setFontState(next);
      persist({ color, font: next });
    },
    [color, persist],
  );

  const reset = React.useCallback(() => {
    setColorState(DEFAULT_PRIMARY_COLOR);
    setFontState(DEFAULT_FONT_KEY);
    persist({ color: DEFAULT_PRIMARY_COLOR, font: DEFAULT_FONT_KEY });
  }, [persist]);

  const value = React.useMemo<AppearanceContextValue>(
    () => ({ color, font, setColor, setFont, reset }),
    [color, font, setColor, setFont, reset],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const ctx = React.useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used inside <AppearanceProvider>");
  }
  return ctx;
}
