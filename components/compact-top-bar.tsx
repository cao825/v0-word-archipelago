"use client"

import { useState, memo } from "react"
import { Trophy, Clock, Target, BookOpen, Menu } from "lucide-react"
import type { GameTheme } from "@/lib/slices/gameSlice"
import { motion } from "framer-motion"

interface CompactTopBarProps {
  score: number
  timeLeft: number
  comboCount: number
  onOpenSettings: () => void
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
  gameActive,
  theme,
  objectivesCompleted,
  totalObjectives,
  foundWordsCount,
  onShowObjectives,
  onShowFoundWords,
}: CompactTopBarProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

  // Calculate time percentage for progress bar
  const timePercentage = (timeLeft / 120) * 100

  // Determine color for time indicator
  const getTimeColor = () => {
    if (timeLeft < 10) return "bg-red-500"
    if (timeLeft < 30) return "bg-amber-500"
    return "bg-emerald-500"
  }

  // Determine background color based on theme
  let bgColor = "bg-sky-900/90"
  let progressBgColor = "bg-sky-800"
  if (theme === "sunset") {
    bgColor = "bg-orange-900/90"
    progressBgColor = "bg-orange-800"
  } else if (theme === "stormy") {
    bgColor = "bg-slate-800/90"
    progressBgColor = "bg-slate-700"
  } else if (theme === "volcanic") {
    bgColor = "bg-red-900/90"
    progressBgColor = "bg-red-800"
  }

  return (
    <div className="sticky top-0 z-30">
      {/* Main top bar */}
      <div className={`${bgColor} backdrop-blur-sm shadow-md h-12 flex items-center justify-between px-3`}>
        {/* Left: Score */}
        <div className="flex items-center gap-1.5">
          <Trophy size={16} className="text-amber-400" />
          <span className="font-bold text-amber-400">{score}</span>
        </div>

        {/* Center: Time */}
        <div className="flex items-center gap-1.5">
          <Clock size={16} className={timeLeft < 30 ? "text-red-400" : "text-white"} />
          <span className="font-mono font-medium">{formattedTime}</span>
        </div>

        {/* Right: Counters and Menu */}
        <div className="flex items-center gap-3">
          {/* Objectives counter */}
          <button
            onClick={onShowObjectives}
            className="flex items-center gap-1 hover:bg-white/10 rounded px-1.5 py-1 transition-colors"
            aria-label="Show objectives"
          >
            <Target size={14} className="text-sky-200" />
            <span className="text-xs font-medium">
              {objectivesCompleted}/{totalObjectives}
            </span>
          </button>

          {/* Words counter */}
          <button
            onClick={onShowFoundWords}
            className="flex items-center gap-1 hover:bg-white/10 rounded px-1.5 py-1 transition-colors"
            aria-label="Show found words"
          >
            <BookOpen size={14} className="text-sky-200" />
            <span className="text-xs font-medium">{foundWordsCount}</span>
          </button>

          {/* Menu button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="hover:bg-white/10 rounded p-1.5 transition-colors relative"
            aria-label="Menu"
          >
            <Menu size={18} />

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 rounded-md shadow-lg py-1 w-36 z-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onOpenSettings()
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm"
                >
                  Settings
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onShowObjectives()
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm"
                >
                  Objectives
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onShowFoundWords()
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-sm"
                >
                  Found Words
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar for time */}
      <div className={`h-1 ${progressBgColor} w-full`}>
        <motion.div
          className={`h-full ${getTimeColor()}`}
          initial={{ width: "100%" }}
          animate={{ width: `${timePercentage}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        ></motion.div>
      </div>
    </div>
  )
})
