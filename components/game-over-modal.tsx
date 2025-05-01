"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Trophy, Share2, RotateCcw } from "lucide-react"
import { resetGameAfterReview } from "@/lib/slices/gameSlice"
import type { RootState } from "@/lib/store"
import ModalOverlay from "./modal-overlay"
import ShareResults from "./share-results"
import ScoreSubmission from "./score-submission"

interface GameOverModalProps {
  score: number
  foundWordsCount: number
  completedObjectives: number
  totalObjectives: number
  puzzleDate: string
}

export default function GameOverModal({
  score,
  foundWordsCount,
  completedObjectives,
  totalObjectives,
  puzzleDate,
}: GameOverModalProps) {
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [showShareScreen, setShowShareScreen] = useState(false)
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false)
  const gameOver = useSelector((state: RootState) => state.game.gameOver)

  // Open modal when game is over
  useEffect(() => {
    if (gameOver) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setShowShareScreen(false) // Reset share screen state when modal closes
    }
  }, [gameOver])

  const handlePlayAgain = () => {
    dispatch(resetGameAfterReview())
    setIsOpen(false)
  }

  const handleShareResults = () => {
    setShowShareScreen(true)
  }

  const handleScoreSubmitted = () => {
    setHasSubmittedScore(true)
  }

  // Determine what content to show in the modal
  const renderModalContent = () => {
    if (showShareScreen) {
      // Show share results screen
      return (
        <ShareResults
          score={score}
          foundWordsCount={foundWordsCount}
          completedObjectives={completedObjectives}
          totalObjectives={totalObjectives}
          puzzleDate={puzzleDate}
        />
      )
    } else {
      // Show game over screen with score submission
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="text-amber-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Game Over!</h2>
            <p className="text-sky-200">Your final score:</p>
            <div className="text-4xl font-bold text-amber-400 my-2">{score}</div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-sky-800/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{foundWordsCount}</div>
                <div className="text-sky-300 text-sm">Words Found</div>
              </div>
              <div className="bg-sky-800/30 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-white">
                  {completedObjectives}/{totalObjectives}
                </div>
                <div className="text-sky-300 text-sm">Objectives</div>
              </div>
            </div>
          </div>

          {!hasSubmittedScore && <ScoreSubmission score={score} onScoreSubmitted={handleScoreSubmitted} />}

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleShareResults}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <Share2 size={18} />
              Share Results
            </button>
            <button
              onClick={handlePlayAgain}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <RotateCcw size={18} />
              Play Again
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={() => {
        // If on share screen, go back to main game over screen
        if (showShareScreen) {
          setShowShareScreen(false)
        } else {
          // Otherwise close the modal and reset the game
          handlePlayAgain()
        }
      }}
      title={showShareScreen ? "Share Results" : "Game Over"}
    >
      {renderModalContent()}
    </ModalOverlay>
  )
}
