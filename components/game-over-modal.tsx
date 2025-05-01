"use client"

import { useState, useEffect, useMemo } from "react"
import { Trophy, Clock, ArrowLeft } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"
import { motion, AnimatePresence } from "framer-motion"
import ScoreSubmission from "./score-submission"
import ShareResults from "./share-results"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { resetGameAfterReview } from "@/lib/slices/gameSlice"

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
  const [showShareResults, setShowShareResults] = useState(false)

  const dispatch = useDispatch()

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

  // Update the onShare function to show the share results
  const handleShare = () => {
    setShowShareResults(true)
    // IMPORTANT: Remove this call to prevent duplicate share modals
    // if (onShare) onShare()
  }

  // Handle when score submission is complete
  const handleScoreSubmitted = () => {
    setScoreSubmitted(true)
    setShowScoreSubmission(false)
  }

  // Handle going back from share results to game over screen
  const handleBackFromShare = () => {
    setShowShareResults(false)
  }

  // Handle play again with proper reset
  const handlePlayAgain = () => {
    // Dispatch the resetGameAfterReview action to properly reset the game
    dispatch(resetGameAfterReview())
    // Then call the original onResetGame function
    onResetGame()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <AnimatePresence mode="wait">
        <motion.div
          key={showShareResults ? "share" : showScoreSubmission ? "submit" : "results"}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: isVisible ? 1 : 0.9,
            opacity: isVisible ? 1 : 0,
          }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        >
          {showScoreSubmission && !scoreSubmitted ? (
            <div className="p-5">
              <ScoreSubmission
                score={score}
                wordsFound={foundWords.length}
                objectivesCompleted={completedObjectivesCount}
                totalObjectives={objectives.length}
                onSubmit={handleScoreSubmitted}
                onSkip={() => setShowScoreSubmission(false)}
              />
            </div>
          ) : showShareResults ? (
            <div className="p-5">
              <div className="flex items-center mb-4">
                <button
                  onClick={handleBackFromShare}
                  className="mr-2 p-1 rounded-full hover:bg-slate-800 transition-colors"
                  aria-label="Back to results"
                >
                  <ArrowLeft size={20} className="text-slate-300" />
                </button>
                <h3 className="text-xl font-bold text-white">Share Your Results</h3>
              </div>
              <ShareResults
                score={score}
                foundWordsCount={foundWords.length}
                completedObjectives={completedObjectivesCount}
                totalObjectives={objectives.length}
                puzzleDate={puzzleDate}
              />
            </div>
          ) : (
            <div className="p-5 text-center">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">Game Over</h2>
                <div className="flex items-center justify-center gap-2 text-white text-sm">
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
                <div className="w-20 h-20 rounded-full bg-amber-500/30 flex items-center justify-center">
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
                <p className="text-white text-sm">Final Score</p>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 mb-5"
              >
                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <div className="text-xl font-bold text-white">{foundWords.length}</div>
                  <div className="text-slate-200 text-xs">Words Found</div>
                </div>
                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <div className="text-xl font-bold text-white">
                    {completedObjectivesCount}/{objectives.length}
                  </div>
                  <div className="text-slate-200 text-xs">Objectives</div>
                </div>
              </motion.div>

              {/* Game highlights section */}
              {foundWords.length > 0 && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-5 bg-slate-800 p-3 rounded-lg border border-slate-700"
                >
                  <h3 className="text-sm font-medium text-white mb-2">Game Highlights</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-700/70 p-2 rounded">
                      <div className="text-amber-300 font-bold">{gameStats.longestWord}</div>
                      <div className="text-slate-200 text-xs">Longest Word ({gameStats.wordLength} letters)</div>
                    </div>
                    <div className="bg-slate-700/70 p-2 rounded">
                      <div className="text-amber-300 font-bold">{gameStats.highestScoringWord}</div>
                      <div className="text-slate-200 text-xs">Highest Points</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-4 mt-6">
                <button
                  onClick={handlePlayAgain}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <span className="mr-2">Play Again</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-md transition-colors duration-200"
                >
                  Share Results
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
