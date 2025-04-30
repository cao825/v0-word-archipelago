"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings, Target, BookOpen, Share2, RotateCcw, Clock, Zap } from "lucide-react"
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
  const [prevComboCount, setPrevComboCount] = useState(0)
  const [showComboAnimation, setShowComboAnimation] = useState(false)

  // Get the completed objectives directly from the Redux store to ensure accuracy
  const completedObjectivesFromStore = useSelector((state: RootState) => state.game.completedObjectives.length)

  // Calculate progress percentage for the time bar
  const timePercentage = (timeLeft / 300) * 100 // Assuming 5 minutes (300 seconds) total

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
          bg: "from-teal-500/10 to-emerald-500/10",
          progress: "bg-gradient-to-r from-teal-400 to-emerald-400",
          accent: "text-teal-400",
          button: "bg-teal-500/20 hover:bg-teal-500/30",
          highlight: "bg-emerald-500/20",
          badge: "bg-teal-400/30 text-teal-50",
        }
      case "sunset":
        return {
          bg: "from-amber-500/10 to-orange-500/10",
          progress: "bg-gradient-to-r from-amber-400 to-orange-400",
          accent: "text-amber-400",
          button: "bg-amber-500/20 hover:bg-amber-500/30",
          highlight: "bg-orange-500/20",
          badge: "bg-amber-400/30 text-amber-50",
        }
      case "stormy":
        return {
          bg: "from-slate-600/10 to-slate-700/10",
          progress: "bg-gradient-to-r from-slate-400 to-slate-500",
          accent: "text-slate-400",
          button: "bg-slate-500/20 hover:bg-slate-500/30",
          highlight: "bg-slate-600/20",
          badge: "bg-slate-400/30 text-slate-50",
        }
      case "volcanic":
        return {
          bg: "from-red-500/10 to-orange-500/10",
          progress: "bg-gradient-to-r from-red-400 to-orange-400",
          accent: "text-red-400",
          button: "bg-red-500/20 hover:bg-red-500/30",
          highlight: "bg-orange-500/20",
          badge: "bg-red-400/30 text-red-50",
        }
      default:
        return {
          bg: "from-sky-500/10 to-indigo-500/10",
          progress: "bg-gradient-to-r from-sky-400 to-indigo-400",
          accent: "text-sky-400",
          button: "bg-sky-500/20 hover:bg-sky-500/30",
          highlight: "bg-indigo-500/20",
          badge: "bg-sky-400/30 text-sky-50",
        }
    }
  }

  const themeColors = getThemeColors()

  return (
    <div className="w-full sticky top-0 z-10">
      {/* Frosted glass container */}
      <div className={`w-full bg-gradient-to-r ${themeColors.bg} backdrop-blur-md border-b border-white/10 shadow-sm`}>
        <div className="max-w-4xl mx-auto px-2">
          {/* Main controls row - single line layout */}
          <div className="h-[52px] flex items-center justify-between">
            {/* Score display */}
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                <span className="text-xl font-medium text-white tabular-nums tracking-tight">{score}</span>
                <span className="text-xs text-white/60 ml-1">pts</span>
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
                    className={`${themeColors.highlight} px-2 py-0.5 rounded-full flex items-center`}
                  >
                    <Zap size={12} className={`${themeColors.accent} mr-0.5`} />
                    <span className="text-white text-xs font-medium">{comboCount}×</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Center controls - evenly spaced */}
            <div className="flex items-center gap-2">
              {/* Objectives button with properly positioned badge */}
              <div className="relative">
                <button
                  onClick={onShowObjectives}
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${themeColors.button} transition-colors duration-200`}
                  title="Objectives"
                >
                  <Target size={16} className="text-white/80" />
                </button>
                <span
                  className={`absolute -top-1 -right-1 ${themeColors.badge} text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center`}
                >
                  {completedObjectivesFromStore}/{totalObjectives}
                </span>
              </div>

              {/* Found words button with properly positioned badge */}
              <div className="relative">
                <button
                  onClick={onShowFoundWords}
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${themeColors.button} transition-colors duration-200`}
                  title="Found Words"
                >
                  <BookOpen size={16} className="text-white/80" />
                </button>
                <span
                  className={`absolute -top-1 -right-1 ${themeColors.badge} text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center`}
                >
                  {foundWordsCount}
                </span>
              </div>

              {/* Share button */}
              <button
                onClick={onShowShareModal}
                className={`flex items-center justify-center h-8 w-8 rounded-full ${themeColors.button} transition-colors duration-200`}
                title="Share Results"
              >
                <Share2 size={16} className="text-white/80" />
              </button>

              {/* Reset button */}
              <button
                onClick={onResetGame}
                className={`flex items-center justify-center h-8 w-8 rounded-full ${themeColors.button} transition-colors duration-200`}
                title="Reset Game"
              >
                <RotateCcw size={16} className="text-white/80" />
              </button>

              {/* Settings button */}
              <button
                onClick={onOpenSettings}
                className={`flex items-center justify-center h-8 w-8 rounded-full ${themeColors.button} transition-colors duration-200`}
                title="Settings"
              >
                <Settings size={16} className="text-white/80" />
              </button>
            </div>

            {/* Time display */}
            <div className="flex items-center">
              <Clock size={14} className="text-white/60 mr-1.5" />
              <span className="text-white text-base font-medium tabular-nums tracking-tight">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Thin progress bar for time visualization */}
      {gameActive && (
        <motion.div className="w-full h-0.5 bg-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className={`h-full ${themeColors.progress}`}
            initial={{ width: `${timePercentage}%` }}
            animate={{ width: `${timePercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      )}
    </div>
  )
}
