"use client"

import { memo, useEffect } from "react"
import GameBoard from "@/components/game-board"
import { Providers } from "@/components/providers"
import { useAppSelector } from "@/lib/hooks/hooks"
import ErrorBoundary from "@/components/error-boundary"
import { getThemeGradient } from "@/lib/utils/theme-config"

export default function Home() {
  // Add error handling for the entire app
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Caught global error:", event.error)
      // Prevent the error from bubbling up further
      event.preventDefault()
    }

    window.addEventListener("error", handleError)

    return () => {
      window.removeEventListener("error", handleError)
    }
  }, [])

  return (
    <ErrorBoundary>
      <Providers>
        <AppContent />
      </Providers>
    </ErrorBoundary>
  )
}

const AppContent = memo(function AppContent() {
  const { theme } = useAppSelector((state) => state.game)
  const bgGradient = getThemeGradient(theme)

  return (
    <main className={`min-h-screen ${bgGradient} text-white pb-6 font-sans`}>
      <header className="pt-4 px-4 text-center">
        <h1 className="text-2xl font-light tracking-tight text-white">
          <span className="font-bold text-amber-400">WORD</span> ISLES
        </h1>
      </header>
      <div className="px-3 max-w-6xl mx-auto">
        <GameBoard />
      </div>
    </main>
  )
})
