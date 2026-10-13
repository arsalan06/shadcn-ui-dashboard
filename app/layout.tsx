import type { Metadata } from "next";
import { Inter, Manrope, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AppearanceProvider } from "@/components/appearance-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_FONT_KEY,
  DEFAULT_PRIMARY_COLOR,
} from "@/lib/appearance";
import "./globals.css";

// The design spec's typeface — self-hosted and subset by next/font instead of
// the runtime <link> tag the original prototype used. It's the default of
// the font-family picker in the appearance panel; the other three below are
// its alternatives, all preloaded so switching between them is instant.
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Daily Close · Citadel Insight",
    template: "%s · Citadel Insight",
  },
  description:
    "Corporate daily close and white-envelope reconciliation for Family Thrift Center.",
};

// Paints the saved primary color and font before first render, the same way
// next-themes' own inline script (rendered inside ThemeProvider below) avoids
// a flash for the light/dark class. Mirrors applyAppearance() in
// appearance-provider.tsx — keep the two in sync.
function initAppearance(
  storageKey: string,
  defaultColor: string,
  defaultFont: string,
) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    const root = document.documentElement;
    const color = (saved && saved.color) || defaultColor;
    const font = (saved && saved.font) || defaultFont;
    root.style.setProperty("--primary", color);
    root.style.setProperty("--ring", color);
    root.style.setProperty("--sidebar-primary", color);
    root.style.setProperty("--sidebar-accent", color);
    root.setAttribute("data-font", font);
  } catch {
    // Storage unavailable — CSS defaults already cover this case.
  }
}

const appearanceInitScript = `(${initAppearance.toString()})(${JSON.stringify(
  APPEARANCE_STORAGE_KEY,
)},${JSON.stringify(DEFAULT_PRIMARY_COLOR)},${JSON.stringify(
  DEFAULT_FONT_KEY,
)});`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${inter.variable} ${manrope.variable} ${outfit.variable} h-full antialiased`}
    >
      <body
        className="min-h-svh bg-background text-foreground"
        suppressHydrationWarning
      >
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: appearanceInitScript }}
        />
        <ThemeProvider>
          <AppearanceProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="bottom-right" />
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
