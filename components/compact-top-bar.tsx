"use client"

import { useState } from "react"
import { Settings, Target, BookOpen, Share2, RotateCcw } from "lucide-react"
import GameStatus from "./game-status"
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

  // Get the completed objectives directly from the Redux store to ensure accuracy
  const completedObjectivesFromStore = useSelector((state: RootState) => state.game.completedObjectives.length)

  // Use the value from the store instead of the prop
  const actualObjectivesCompleted = completedObjectivesFromStore

  // Add progress indicator
  const progressPercentage = (actualObjectivesCompleted / totalObjectives) * 100

  const bonusWords = ["Word1", "Word2", "Word3", "Word4"] // Example bonus words

  return (
    <div className="w-full bg-sky-900/80 backdrop-blur-sm border-b border-sky-800 p-2 sticky top-0 z-10 shadow-md">
      <div className="flex flex-col gap-1 max-w-4xl mx-auto">
        {/* Main controls row */}
        <div className="flex items-center justify-between gap-2">
          {/* Game status with flex-shrink to allow it to compress when needed */}
          <div className="flex-shrink min-w-0">
            <GameStatus
              score={score}
              timeLeft={timeLeft}
              message={message}
              gameActive={gameActive}
              comboCount={comboCount}
              isMobile={isMobile}
            />
          </div>

          {/* Right side controls with nowrap and overflow handling */}
          <div className="flex items-center gap-1 flex-nowrap">
            {/* Bonus Words Section */}
            <div className="flex items-center">
              <span className="text-xs font-medium mr-1">Bonus:</span>
              <div className="flex flex-wrap items-center max-w-[120px] overflow-hidden">
                {bonusWords.length > 0 ? (
                  bonusWords.length > 3 ? (
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      +{bonusWords.length}
                    </span>
                  ) : (
                    bonusWords.map((word, index) => (
                      <span
                        key={index}
                        className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mr-1 mb-1"
                      >
                        {word}
                      </span>
                    ))
                  )
                ) : (
                  <span className="text-xs text-gray-400">None</span>
                )}
              </div>
            </div>

            {/* Fixed: Added py-1 for vertical padding to prevent buttons from being cut off */}
            <button
              onClick={onShowFoundWords}
              className="relative flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-sky-800 hover:bg-sky-700 text-white my-1"
              title="Found Words"
            >
              <BookOpen size={16} />
              {/* Show condensed badge for high counts */}
              {foundWordsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center text-[10px] shadow-sm">
                  {foundWordsCount > 99 ? "99+" : foundWordsCount}
                </span>
              )}
            </button>

            <button
              onClick={onShowObjectives}
              className="relative flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-sky-800 hover:bg-sky-700 text-white my-1"
              title="Objectives"
            >
              <Target size={16} />
              {/* Fixed: Adjusted badge positioning to prevent it from being cut off */}
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 min-w-4 px-1 flex items-center justify-center text-[10px] shadow-sm">
                {actualObjectivesCompleted}/{totalObjectives}
              </span>
            </button>

            <button
              onClick={onShowShareModal}
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-sky-800 hover:bg-sky-700 text-white my-1"
              title="Share"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={onResetGame}
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-sky-800 hover:bg-sky-700 text-white my-1"
              title="Reset Game"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={onOpenSettings}
              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-sky-800 hover:bg-sky-700 text-white my-1"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar for objectives */}
        {gameActive && (
          <div className="w-full h-1 bg-sky-800/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
