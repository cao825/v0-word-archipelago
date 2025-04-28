"use client"

import { useState, useEffect, useMemo } from "react"
import { RotateCcw, Share2, Trophy, Clock } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"
import { motion } from "framer-motion"

interface GameOverModalProps {
  score: number
  foundWords: string[]
  objectives: Objective[]
  onResetGame: () => void
  onShare: () => void
}

export default function GameOverModal({ score, foundWords, objectives, onResetGame, onShare }: GameOverModalProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: string
    seconds: string
  }>({
    minutes: "00",
    seconds: "00",
  })

  const [isVisible, setIsVisible] = useState(false)

  // Animation delay for modal appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Count completed objectives
  const completedObjectives = objectives.filter((obj) => obj.completed).length

  // Calculate time until next puzzle
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

      // Check if we've reached the next hour (countdown reached zero)
      if (diffMinutes === 0 && diffSeconds === 0) {
        // Refresh the page to get the new puzzle
        window.location.reload()
      }
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [])

  // Find longest word and highest scoring word
  const gameStats = useMemo(() => {
    if (foundWords.length === 0) return { longestWord: "", highestScoringWord: "" }

    const longestWord = [...foundWords].sort((a, b) => b.length - a.length)[0]

    // Simple scoring: word length * 10 (this is a simplification)
    const highestScoringWord = [...foundWords].sort((a, b) => b.length - a.length)[0]

    return {
      longestWord: longestWord.toUpperCase(),
      highestScoringWord: highestScoringWord.toUpperCase(),
      wordLength: longestWord.length,
    }
  }, [foundWords])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: isVisible ? 1 : 0.9,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-5 text-center">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">Game Over</h2>
            <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
              <Clock size={14} className="text-amber-400" />
              <p>
                Next puzzle in {timeRemaining.minutes}:{timeRemaining.seconds}
              </p>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-4xl font-bold text-amber-400">{score}</div>
            <p className="text-slate-300 text-sm">Final Score</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-800/50 p-2 rounded-lg">
              <div className="text-xl font-bold text-white">{foundWords.length}</div>
              <div className="text-slate-400 text-xs">Words Found</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-lg">
              <div className="text-xl font-bold text-white">
                {completedObjectives}/{objectives.length}
              </div>
              <div className="text-slate-400 text-xs">Objectives</div>
            </div>
          </div>

          {/* New section for game highlights */}
          {foundWords.length > 0 && (
            <div className="mb-5 bg-slate-800/30 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Game Highlights</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-amber-400 font-medium">{gameStats.longestWord}</div>
                  <div className="text-slate-400 text-xs">Longest Word ({gameStats.wordLength} letters)</div>
                </div>
                <div>
                  <div className="text-amber-400 font-medium">{gameStats.highestScoringWord}</div>
                  <div className="text-slate-400 text-xs">Highest Points</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onShare}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors text-sm"
            >
              <Share2 size={16} />
              Share Results
            </button>
            <button
              onClick={onResetGame}
              className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors text-sm"
            >
              <RotateCcw size={16} />
              Play Again
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
