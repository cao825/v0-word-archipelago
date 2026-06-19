import type { MetadataRoute } from "next"

// PWA manifest (Next auto-serves at /manifest.webmanifest and links it in <head>).
// Icons reference only assets that exist in public/: a scalable SVG (sizes "any")
// + the 32×32 PNG. NOTE: dedicated 192×192 and 512×512 maskable PNGs are NOT yet
// in the repo — add them for full installability / Android home-screen icons.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Word Isles | Hourly Word Puzzle Game",
    short_name: "Word Isles",
    description:
      "Navigate between tropical isles to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
    start_url: "/",
    display: "standalone",
    background_color: "#082f49", // Tailwind sky-950 — base of the theme gradient
    theme_color: "#0c4a6e", // Tailwind sky-900 — matches the viewport themeColor
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-light-32x32.png", type: "image/png", sizes: "32x32" },
    ],
  }
}
