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

  return (
    <div className="w-full bg-sky-900/80 backdrop-blur-sm border-b border-sky-800 p-2 sticky top-0 z-10 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
        <GameStatus
          score={score}
          timeLeft={timeLeft}
          message={message}
          gameActive={gameActive}
          comboCount={comboCount}
          isMobile={isMobile}
        />

        <div className="flex items-center gap-1">
          <button
            onClick={onShowFoundWords}
            className="relative flex items-center justify-center h-9 w-9 rounded-md bg-sky-800 hover:bg-sky-700 text-white"
            title="Found Words"
          >
            <BookOpen size={18} />
            <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {foundWordsCount}
            </span>
          </button>

          <button
            onClick={onShowObjectives}
            className="relative flex items-center justify-center h-9 w-9 rounded-md bg-sky-800 hover:bg-sky-700 text-white"
            title="Objectives"
          >
            <Target size={18} />
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {actualObjectivesCompleted}/{totalObjectives}
            </span>
          </button>

          <button
            onClick={onShowShareModal}
            className="flex items-center justify-center h-9 w-9 rounded-md bg-sky-800 hover:bg-sky-700 text-white"
            title="Share"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={onResetGame}
            className="flex items-center justify-center h-9 w-9 rounded-md bg-sky-800 hover:bg-sky-700 text-white"
            title="Reset Game"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center h-9 w-9 rounded-md bg-sky-800 hover:bg-sky-700 text-white"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
