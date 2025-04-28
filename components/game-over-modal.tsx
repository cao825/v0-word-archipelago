"use client"

import { useState, useEffect, useMemo } from "react"
import { RotateCcw, Share2, Trophy, Clock } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"
import { motion, AnimatePresence } from "framer-motion"
import ScoreSubmission from "./score-submission"
import ShareResults from "./share-results"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

interface GameOverModalProps {
  score: number
  foundWords: string[]
  objectives: Objective[]
  onResetGame: () => void
  onShare: () => void
  puzzleDate?: string
}

export default function GameOverModal({
  score,
  foundWords,
  objectives,
  onResetGame,
  onShare,
  puzzleDate = new Date().toISOString(),
}: GameOverModalProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: string
    seconds: string
  }>({
    minutes: "00",
    seconds: "00",
  })

  const [isVisible, setIsVisible] = useState(false)
  const [showScoreSubmission, setShowScoreSubmission] = useState(false)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Get the completed objectives directly from the Redux store to ensure accuracy
  const completedObjectives = useSelector((state: RootState) => state.game.completedObjectives)
  const completedObjectivesCount = completedObjectives.length

  // Animation delay for modal appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300) // Reduced delay for better UX

    return () => clearTimeout(timer)
  }, [])

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

  // Check if score qualifies for leaderboard
  useEffect(() => {
    // Simple qualification check - can be made more sophisticated
    if (score > 100) {
      setShowScoreSubmission(true)
    }
  }, [score])

  // Update the onShare function to show the share modal
  const handleShare = () => {
    setShowShareModal(true)
    if (onShare) onShare()
  }

  // Handle when score submission is complete
  const handleScoreSubmitted = () => {
    setScoreSubmitted(true)
    setShowScoreSubmission(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 p-4">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: isVisible ? 1 : 0.9,
            opacity: isVisible ? 1 : 0,
          }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {showScoreSubmission && !scoreSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5"
            >
              <ScoreSubmission
                score={score}
                wordsFound={foundWords.length}
                objectivesCompleted={completedObjectivesCount}
                totalObjectives={objectives.length}
                onSubmit={handleScoreSubmitted}
                onSkip={() => setShowScoreSubmission(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-5 text-center"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">Game Over</h2>
                <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
                  <Clock size={14} className="text-amber-400" />
                  <p>
                    Next puzzle in {timeRemaining.minutes}:{timeRemaining.seconds}
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center mb-4"
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <div className="text-4xl font-bold text-amber-400">{score}</div>
                <p className="text-slate-300 text-sm">Final Score</p>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 mb-5"
              >
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-xl font-bold text-white">{foundWords.length}</div>
                  <div className="text-slate-400 text-xs">Words Found</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {completedObjectivesCount}/{objectives.length}
                  </div>
                  <div className="text-slate-400 text-xs">Objectives</div>
                </div>
              </motion.div>

              {/* New section for game highlights */}
              {foundWords.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-5 bg-slate-800/30 p-3 rounded-lg"
                >
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
                </motion.div>
              )}

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-2"
              >
                <button
                  onClick={handleShare}
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
              </motion.div>
            </motion.div>
          )}

          <AnimatePresence>
            {showShareModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-10"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-slate-800 rounded-xl p-5 w-full max-w-md"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Share Your Results</h3>
                  <ShareResults
                    score={score}
                    foundWordsCount={foundWords.length}
                    completedObjectives={completedObjectivesCount}
                    totalObjectives={objectives.length}
                    puzzleDate={puzzleDate}
                  />
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
