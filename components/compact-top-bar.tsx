"use client"
import { Clock, Trophy, Settings, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GameTheme } from "@/lib/slices/gameSlice"

interface CompactTopBarProps {
  score: number
  timeLeft: number
  comboCount: number
  onOpenSettings: () => void
  onResetGame: () => void
  gameActive: boolean
  theme: GameTheme
}

export default function CompactTopBar({
  score,
  timeLeft,
  comboCount,
  onOpenSettings,
  onResetGame,
  gameActive,
  theme,
}: CompactTopBarProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-sky-900/80 border-b border-sky-700 shadow-md">
      <div className="flex items-center justify-between h-10 px-2">
        {/* Score */}
        <div className="flex items-center gap-1">
          <Trophy size={14} className="text-amber-400" />
          <span className="font-medium text-amber-400 text-sm">{score}</span>

          {/* Combo indicator */}
          {gameActive && comboCount >= 2 && (
            <div className="ml-1 bg-amber-600/80 text-white text-xs px-1 py-0.5 rounded-md animate-pulse">
              x{comboCount}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1 ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
          <Clock size={14} className={timeLeft < 30 ? "text-red-400" : "text-white"} />
          <span className="font-mono font-medium text-sm">{formattedTime}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {gameActive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-100 hover:bg-sky-800 hover:text-white"
              onClick={onResetGame}
              title="Reset Game"
            >
              <RefreshCw size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-sky-100 hover:bg-sky-800 hover:text-white"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>

      {/* Progress bar instead of message */}
      {gameActive && (
        <div className="h-0.5 bg-sky-800 w-full">
          <div
            className="h-full bg-amber-500"
            style={{ width: `${(timeLeft / 120) * 100}%`, transition: "width 1s linear" }}
          ></div>
        </div>
      )}
    </div>
  )
}
