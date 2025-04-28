"use client"

import { Clock, Zap } from "lucide-react"

interface GameStatusProps {
  score: number
  timeLeft: number
  message?: string
  gameActive: boolean
  comboCount: number
  isMobile?: boolean
}

export default function GameStatus({
  score,
  timeLeft,
  message = "",
  gameActive,
  comboCount,
  isMobile = false,
}: GameStatusProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`

  return (
    <div className="flex items-center gap-2 text-white">
      {/* Score - always visible */}
      <div className="flex items-center">
        <span className="font-bold text-amber-400 text-lg mr-1">{score}</span>
        <span className="text-xs text-slate-300">pts</span>
      </div>

      {/* Time - only visible during active game */}
      {gameActive && (
        <div className="flex items-center gap-1 bg-sky-800/50 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3 text-sky-300" />
          <span className="text-sm font-medium tabular-nums">{formattedTime}</span>
        </div>
      )}

      {/* Combo counter - only visible when combo > 1 */}
      {comboCount > 1 && (
        <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded whitespace-nowrap">
          <Zap className="h-3 w-3 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">{comboCount}x</span>
        </div>
      )}

      {/* Message - only show on larger screens and when not too long */}
      {!isMobile && message && (
        <div className="hidden sm:block max-w-[150px] truncate">
          <span className="text-xs text-slate-300">{message}</span>
        </div>
      )}
    </div>
  )
}
