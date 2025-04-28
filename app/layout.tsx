import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Word Archipelago | Hourly Word Puzzle Game",
  description:
    "Navigate between tropical islands to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
  keywords: "word game, puzzle game, word archipelago, hourly puzzle, word challenge, island game",
  openGraph: {
    title: "Word Archipelago | Hourly Word Puzzle Game",
    description:
      "Navigate between tropical islands to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
    url: "https://word-archipelago.vercel.app",
    siteName: "Word Archipelago",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Word Archipelago Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Archipelago | Hourly Word Puzzle Game",
    description:
      "Navigate between tropical islands to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
