"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function NextPuzzleCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: string
    seconds: string
  }>({
    minutes: "00",
    seconds: "00",
  })

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
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-amber-600 bg-amber-600/30 shadow-lg">
      <CardContent className="p-3 flex items-center justify-between">
        <span className="text-xs uppercase font-light tracking-wider text-amber-200">Next Puzzle</span>
        <span className="text-lg font-mono font-bold text-amber-100">
          {timeRemaining.minutes}:{timeRemaining.seconds}
        </span>
      </CardContent>
    </Card>
  )
}
