import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Word Isles | Hourly Word Puzzle Game",
  description:
    "Navigate between tropical isles to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
  keywords: "word game, puzzle game, word isles, hourly puzzle, word challenge, isle game",
  openGraph: {
    title: "Word Isles | Hourly Word Puzzle Game",
    description:
      "Navigate between tropical isles to form words in this hourly word puzzle game. Challenge yourself with new objectives every hour!",
    url: "https://word-isles.vercel.app",
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
