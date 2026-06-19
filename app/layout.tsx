import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// metadataBase resolves relative metadata URLs (openGraph/twitter images) to
// absolute ones for scrapers/crawlers. Without it, relative image paths can't
// resolve and shared links unfurl without an image.
// Canonical production domain (confirmed + live-serving the deployment).
const SITE_URL = "https://wordisles.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Word Isles | Hourly Word Puzzle Game",
  description:
    "Navigate between tropical isles to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
  keywords: "word game, puzzle game, word isles, hourly puzzle, word challenge, isle game",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Word Isles | Hourly Word Puzzle Game",
    description:
      "Navigate between tropical isles to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
    url: SITE_URL,
    siteName: "Word Isles",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Word Isles Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Isles | Hourly Word Puzzle Game",
    description:
      "Navigate between tropical isles to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.app'
}

// themeColor lives in the Viewport export, not metadata (Next 15/16 moved it —
// themeColor in `metadata` is ignored). #0c4a6e = Tailwind sky-900, the top of
// the app's default "tropical" theme gradient (from-sky-900 … to-sky-950).
export const viewport: Viewport = {
  themeColor: "#0c4a6e",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
