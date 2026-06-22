// This file contains synchronous utility functions that should not be cached

// Single source of truth for the theme union lives in the Redux slice; import it
// here so the theme registry can't drift from the stored theme value (type-only
// import — erased at compile time, no runtime dependency on the slice).
import type { GameTheme } from "@/lib/slices/gameSlice"

export type { GameTheme }

export interface ThemeConfig {
  gradient: string
  name: string
}

export const THEME_CONFIGS: Record<GameTheme, ThemeConfig> = {
  tropical: {
    gradient: "bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950",
    name: "Ocean Blue",
  },
  sunset: {
    gradient: "bg-gradient-to-b from-blue-900 via-orange-900 to-blue-950",
    name: "Sunset",
  },
  stormy: {
    gradient: "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950",
    name: "Stormy",
  },
  volcanic: {
    gradient: "bg-gradient-to-b from-red-950 via-red-900 to-slate-950",
    name: "Volcanic",
  },
} as const

// Simple getter functions - no caching needed. THEME_CONFIGS is a complete
// Record<GameTheme, ThemeConfig>, so the lookup can't miss — no fallback needed.
export const getThemeGradient = (theme: GameTheme): string => THEME_CONFIGS[theme].gradient

export const getThemeName = (theme: GameTheme): string => THEME_CONFIGS[theme].name
