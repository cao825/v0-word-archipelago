"use client"
import { Clock, Trophy, Settings, Target, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GameTheme } from "@/lib/slices/gameSlice"
import { motion } from "framer-motion"

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
}

export default function CompactTopBar({
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
}: CompactTopBarProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  // Calculate time percentage for progress bar
  const timePercentage = (timeLeft / 120) * 100

  // Determine color for time indicator
  const getTimeColor = () => {
    if (timeLeft < 10) return "bg-red-500"
    if (timeLeft < 30) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="sticky top-0 z-30 backdrop-blur-md bg-sky-900/80 border-b border-sky-700 shadow-md">
      <div className="flex items-center justify-between h-10 px-2">
        {/* Score and Objectives */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Trophy size={14} className="text-amber-400" />
            <span className="font-mono font-medium text-amber-400 text-sm w-[2.5rem] text-right">{score}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onShowObjectives}
            className="h-6 w-6 p-0.5 text-sky-100 hover:bg-sky-800 hover:text-white relative"
            title="Show Objectives"
          >
            <Target size={14} className="text-sky-200" />
            <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center">
              {objectivesCompleted}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onShowFoundWords}
            className="h-6 w-6 p-0.5 text-sky-100 hover:bg-sky-800 hover:text-white relative"
            title="Show Found Words"
          >
            <BookOpen size={14} className="text-sky-200" />
            <span className="absolute -top-0.5 -right-0.5 bg-sky-600 text-white text-[10px] rounded-full h-3.5 w-3.5 flex items-center justify-center">
              {foundWordsCount}
            </span>
          </Button>

          {/* Combo indicator */}
          {gameActive && comboCount >= 2 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="ml-1 bg-amber-600/80 text-white text-xs px-1.5 py-0.5 rounded-md"
            >
              x{comboCount}
            </motion.div>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1 ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
          <Clock size={14} className={timeLeft < 30 ? "text-red-400" : "text-white"} />
          <span className="font-mono font-medium text-sm">{formattedTime}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
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

      {/* Progress bar for time */}
      {gameActive && (
        <div className="h-1 bg-sky-800 w-full">
          <motion.div
            className={`h-full ${getTimeColor()}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timePercentage}%` }}
            transition={{ duration: 0.5, ease: "linear" }}
          ></motion.div>
        </div>
      )}
    </div>
  )
}
