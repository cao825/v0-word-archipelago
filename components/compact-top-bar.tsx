"use client"
import { Clock, Trophy, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GameTheme } from "@/lib/slices/gameSlice"

interface CompactTopBarProps {
  score: number
  timeLeft: number
  comboCount: number
  onOpenSettings: () => void
  gameActive: boolean
  theme: GameTheme
}

export default function CompactTopBar({
  score,
  timeLeft,
  comboCount,
  onOpenSettings,
  gameActive,
  theme,
}: CompactTopBarProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-sky-900/80 border-b border-sky-700 shadow-md">
      <div className="flex items-center justify-between h-12 px-3">
        {/* Score */}
        <div className="flex items-center gap-1.5">
          <Trophy size={16} className="text-amber-400" />
          <span className="font-medium text-amber-400">{score}</span>

          {/* Combo indicator */}
          {gameActive && comboCount >= 2 && (
            <div className="ml-1.5 bg-amber-600/80 text-white text-xs px-1.5 py-0.5 rounded-md animate-pulse">
              x{comboCount}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
          <Clock size={16} className={timeLeft < 30 ? "text-red-400" : "text-white"} />
          <span className="font-mono font-medium">{formattedTime}</span>
        </div>

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sky-100 hover:bg-sky-800 hover:text-white"
          onClick={onOpenSettings}
        >
          <Settings size={16} />
        </Button>
      </div>
    </div>
  )
}
