"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Target, BookOpen, Share2, RotateCcw } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import type { GameTheme } from "@/lib/slices/gameSlice"

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
  onResetGame: () => void
  isMobile?: boolean
}

export default function CompactTopBar({
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
  onShowShareModal,
  onResetGame,
  isMobile = false,
}: CompactTopBarProps) {
  const [message, setMessage] = useState("Select islands to form words!")
  const [prevComboCount, setPrevComboCount] = useState(0)
  const [showComboAnimation, setShowComboAnimation] = useState(false)

  // Get the completed objectives directly from the Redux store to ensure accuracy
  const completedObjectivesFromStore = useSelector((state: RootState) => state.game.completedObjectives.length)

  // Use the value from the store instead of the prop
  const actualObjectivesCompleted = completedObjectivesFromStore

  // Add progress indicator
  const progressPercentage = (actualObjectivesCompleted / totalObjectives) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Animate combo count when it changes
  useEffect(() => {
    if (comboCount > prevComboCount && comboCount > 1) {
      setShowComboAnimation(true)
      const timer = setTimeout(() => {
        setShowComboAnimation(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
    setPrevComboCount(comboCount)
  }, [comboCount, prevComboCount])

  // Get theme-appropriate colors
  const getThemeColors = () => {
    switch (theme) {
      case "tropical":
        return {
          bg: "from-teal-500/30 to-emerald-500/30",
          accent: "bg-teal-500",
          highlight: "bg-emerald-400",
          text: "text-teal-900",
          border: "border-teal-200",
        }
      case "sunset":
        return {
          bg: "from-amber-500/30 to-orange-500/30",
          accent: "bg-amber-500",
          highlight: "bg-orange-400",
          text: "text-amber-900",
          border: "border-amber-200",
        }
      case "stormy":
        return {
          bg: "from-slate-600/30 to-slate-700/30",
          accent: "bg-slate-500",
          highlight: "bg-slate-400",
          text: "text-slate-900",
          border: "border-slate-300",
        }
      case "volcanic":
        return {
          bg: "from-red-500/30 to-orange-500/30",
          accent: "bg-red-500",
          highlight: "bg-orange-400",
          text: "text-red-900",
          border: "border-red-200",
        }
      default:
        return {
          bg: "from-sky-500/30 to-indigo-500/30",
          accent: "bg-sky-500",
          highlight: "bg-indigo-400",
          text: "text-sky-900",
          border: "border-sky-200",
        }
    }
  }

  const themeColors = getThemeColors()

  return (
    <div className="w-full sticky top-0 z-10">
      {/* Glass-morphism container with subtle gradient */}
      <div
        className={`w-full bg-gradient-to-r ${themeColors.bg} backdrop-blur-md border-b border-white/10 p-2 shadow-sm`}
      >
        <div className="flex flex-col gap-1 max-w-4xl mx-auto">
          {/* Main controls row */}
          <div className="flex items-center justify-between gap-2">
            {/* Score display with animation */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white/70">Score</span>
                <span className="text-2xl font-bold text-white tracking-tight">{score}</span>
              </div>

              {/* Combo indicator with animation */}
              <AnimatePresence>
                {comboCount > 1 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: showComboAnimation ? [1, 1.2, 1] : 1,
                      opacity: 1,
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex items-center"
                  >
                    <span className="text-white text-sm font-bold">{comboCount}×</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Center controls with hover effects */}
            <div className="flex items-center gap-2">
              <button
                onClick={onShowObjectives}
                className="relative flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                title="Objectives"
              >
                <Target size={14} className="text-white" />
                <span className="text-white text-xs font-medium">
                  {actualObjectivesCompleted}/{totalObjectives}
                </span>
              </button>

              <button
                onClick={onShowFoundWords}
                className="relative flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                title="Found Words"
              >
                <BookOpen size={14} className="text-white" />
                <span className="text-white text-xs font-medium">{foundWordsCount}</span>
              </button>
            </div>

            {/* Time display with animation */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-white/70">Time</span>
                <span className="text-2xl font-bold text-white tracking-tight">{formatTime(timeLeft)}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onShowShareModal}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                  title="Share"
                >
                  <Share2 size={16} className="text-white" />
                </button>

                <button
                  onClick={onResetGame}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                  title="Reset Game"
                >
                  <RotateCcw size={16} className="text-white" />
                </button>

                <button
                  onClick={onOpenSettings}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
                  title="Settings"
                >
                  <Settings size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar for objectives with animation */}
          {gameActive && (
            <motion.div
              className="w-full h-1 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full bg-white/40"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
