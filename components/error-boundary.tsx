"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-sky-800/80 border border-sky-700 rounded-lg p-6 max-w-md w-full shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-4">
            <span className="text-amber-400">Oops!</span> Something went wrong
          </h1>
          <p className="text-sky-200 mb-6">
            We encountered an error while loading Word Archipelago. Please try refreshing the page.
          </p>
          <div className="bg-sky-900/80 rounded-md p-3 mb-6 border border-sky-700 text-sm text-sky-300 overflow-auto max-h-32">
            {error?.message || "Unknown error"}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
