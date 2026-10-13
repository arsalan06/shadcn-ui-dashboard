"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  CheckIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppearance } from "@/components/appearance-provider";
import { FONT_OPTIONS, PRESET_COLORS, type FontKey } from "@/lib/appearance";
import { cn } from "cn";

const noop = () => () => {};

/**
 * The resolved theme is unknown on the server, so the active mode button
 * may not differ before hydration — same guard as theme-toggle.tsx.
 */
function useHydrated() {
  return React.useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

const MODES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

export function AppearancePanel() {
  const { theme, setTheme } = useTheme();
  const { color, font, setColor, setFont, reset } = useAppearance();
  const hydrated = useHydrated();
  const activeMode = hydrated ? theme : undefined;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Customize appearance"
          >
            <PaletteIcon />
          </Button>
        }
      />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Appearance</SheetTitle>
          <SheetDescription>
            Personalize the theme, primary color and font for this device.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm leading-none font-medium">Theme</span>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((mode) => (
                <Button
                  key={mode.value}
                  variant={activeMode === mode.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={activeMode === mode.value}
                  onClick={() => setTheme(mode.value)}
                >
                  <mode.icon data-icon="inline-start" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <span className="text-sm leading-none font-medium">
              Primary color
            </span>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  aria-label={preset.name}
                  aria-pressed={color === preset.value}
                  onClick={() => setColor(preset.value)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-colors",
                    color === preset.value
                      ? "ring-foreground"
                      : "ring-transparent hover:ring-border",
                  )}
                  style={{ backgroundColor: preset.value }}
                >
                  {color === preset.value && (
                    <CheckIcon className="size-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label htmlFor="appearance-font">Font family</Label>
            <Select
              value={font}
              onValueChange={(v) => v && setFont(v as FontKey)}
            >
              <SelectTrigger id="appearance-font" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
