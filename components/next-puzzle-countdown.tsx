"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

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
    <Card className="border-sky-700 bg-sky-800/80 shadow-sm">
      <CardContent className="p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-amber-400" />
          <span className="text-xs uppercase font-light tracking-wider text-amber-200">Next Puzzle</span>
        </div>
        <span className="text-sm font-mono font-medium text-amber-100">
          {timeRemaining.minutes}:{timeRemaining.seconds}
        </span>
      </CardContent>
    </Card>
  )
}
