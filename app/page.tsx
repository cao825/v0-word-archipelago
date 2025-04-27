"use client"

import { memo, lazy, Suspense } from "react"
import { Providers } from "@/components/providers"
import LoadingState from "@/components/loading-state"
import ErrorBoundary from "@/components/error-boundary"

// Lazy load the GameBoard component
const GameBoard = lazy(() => import("@/components/game-board"))

export default function Home() {
  return (
    <ErrorBoundary>
      <Providers>
        <Suspense fallback={<LoadingState />}>
          <AppContent />
        </Suspense>
      </Providers>
    </ErrorBoundary>
  )
}

// Memoize the AppContent component to prevent unnecessary re-renders
const AppContent = memo(function AppContent() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950 text-white pb-8 font-sans">
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
