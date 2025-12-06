"use cache"

export type GameTheme = "default" | "sunset" | "stormy" | "volcanic"

export interface ThemeConfig {
  gradient: string
  name: string
}

export const THEME_CONFIGS: Record<GameTheme, ThemeConfig> = {
  default: {
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
}

export function getThemeGradient(theme: GameTheme): string {
  return THEME_CONFIGS[theme]?.gradient || THEME_CONFIGS.default.gradient
}

export function getThemeName(theme: GameTheme): string {
  return THEME_CONFIGS[theme]?.name || THEME_CONFIGS.default.name
}
