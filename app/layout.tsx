import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Word Archipelago | Daily Word Puzzle Game",
  description:
    "Navigate between tropical islands to form words in this daily word puzzle game. Challenge yourself with new objectives every day!",
  keywords: "word game, puzzle game, word archipelago, daily puzzle, word challenge, island game",
  openGraph: {
    title: "Word Archipelago | Daily Word Puzzle Game",
    description:
      "Navigate between tropical islands to form words in this daily word puzzle game. Challenge yourself with new objectives every day!",
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
    title: "Word Archipelago | Daily Word Puzzle Game",
    description:
      "Navigate between tropical islands to form words in this daily word puzzle game. Challenge yourself with new objectives every day!",
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
