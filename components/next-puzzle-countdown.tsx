"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function NextPuzzleCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: string
    seconds: string
  }>({
    minutes: "00",
    seconds: "00",
  })

  // Calculate time until next puzzle
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0)

      const diffMs = nextHour.getTime() - now.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffSeconds = Math.floor((diffMs % 60000) / 1000)

      setTimeRemaining({
        minutes: String(diffMinutes).padStart(2, "0"),
        seconds: String(diffSeconds).padStart(2, "0"),
      })

      // Check if we've reached the next hour (countdown reached zero)
      if (diffMinutes === 0 && diffSeconds === 0) {
        // Refresh the page to get the new puzzle
        window.location.reload()
      }
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="flex items-center gap-2 text-amber-400 mb-1">
        <Clock size={18} />
        <span className="text-lg font-mono font-bold">
          {timeRemaining.minutes}:{timeRemaining.seconds}
        </span>
      </div>
      <p className="text-sm text-slate-300">until next puzzle</p>
    </div>
  )
}
