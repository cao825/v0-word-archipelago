"use client"

import { memo } from "react"
import GameBoard from "@/components/game-board"
import { Providers } from "@/components/providers"
import { useAppSelector } from "@/lib/hooks/hooks"

export default function Home() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}

// Memoize the AppContent component to prevent unnecessary re-renders
const AppContent = memo(function AppContent() {
  const { theme } = useAppSelector((state) => state.game)

  // Set background gradient based on theme
  let bgGradient = 'bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950"a-sky-800 to-sky-950'

  if (theme === "sunset") {
    bgGradient = "bg-gradient-to-b from-blue-900 via-orange-900 to-blue-950"
  } else if (theme === "stormy") {
    bgGradient = "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950"
  }

  return (
    <main className={`min-h-screen ${bgGradient} text-white pb-8 font-sans`}>
      <header className="pt-8 pb-6 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
          <span className="font-bold text-amber-400">WORD</span> ARCHIPELAGO
        </h1>
        <p className="text-sky-200 text-sm tracking-wide uppercase">Navigate between islands to form words</p>
      </header>
      <div className="px-4 max-w-6xl mx-auto">
        <GameBoard />
      </div>
    </main>
  )
})
