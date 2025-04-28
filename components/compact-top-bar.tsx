"use client"

import { Share2, Clock, BookOpen, Settings, RotateCcw } from "lucide-react"
import { memo } from "react"
import type { GameTheme } from "@/lib/slices/gameSlice"

interface CompactTopBarProps {
  score: number
  timeLeft: number
  comboCount: number
  onOpenSettings: () => void
  onResetGame: () => void
  gameActive: boolean
  theme: GameTheme
  objectivesCompleted: number
  totalObjectives: number
  foundWordsCount: number
  onShowObjectives: () => void
  onShowFoundWords: () => void
  onShowShareModal: () => void
}

export default memo(function CompactTopBar({
  score,
  timeLeft,
  comboCount,
  onOpenSettings,
  onResetGame,
  gameActive,
  theme,
  objectivesCompleted,
  totalObjectives,
  foundWordsCount,
  onShowObjectives,
  onShowFoundWords,
  onShowShareModal,
}: CompactTopBarProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

  // Determine background color based on theme
  let bgColor = "bg-sky-800/80"
  if (theme === "sunset") {
    bgColor = "bg-orange-900/80"
  } else if (theme === "stormy") {
    bgColor = "bg-slate-800/80"
  } else if (theme === "volcanic") {
    bgColor = "bg-red-900/80"
  }

  return (
    <div
      className={`${bgColor} backdrop-blur-sm text-white rounded-lg p-2 shadow-lg flex flex-wrap justify-between items-center gap-2 sticky top-0 z-10`}
    >
      {/* Left side - Score and Time */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Score</div>
          <div className="text-xl font-bold">{score}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Time</div>
          <div className="text-xl font-bold flex items-center gap-1">
            <Clock size={16} />
            {formattedTime}
          </div>
        </div>

        {comboCount > 1 && (
          <div className="flex flex-col items-center">
            <div className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Combo</div>
            <div className="text-xl font-bold">x{comboCount}</div>
          </div>
        )}
      </div>

      {/* Right side - Objectives, Words, Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowObjectives}
          className="flex flex-col items-center p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Show objectives"
        >
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Objectives</div>
          <div className="text-sm font-bold">
            {objectivesCompleted}/{totalObjectives}
          </div>
        </button>

        <button
          onClick={onShowFoundWords}
          className="flex flex-col items-center p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Show found words"
        >
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Words</div>
          <div className="text-sm font-bold flex items-center gap-1">
            <BookOpen size={14} />
            {foundWordsCount}
          </div>
        </button>

        <button
          onClick={onShowShareModal}
          className="flex flex-col items-center p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Share results"
        >
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wide">Share</div>
          <div className="text-sm font-bold flex items-center gap-1">
            <Share2 size={14} />
          </div>
        </button>

        <div className="flex gap-1">
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={onResetGame}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            aria-label="Reset game"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  )
})
