"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Target, BookOpen, Settings, RotateCcw, Share2 } from "lucide-react"
import GameStatus from "./game-status"

interface CompactTopBarProps {
  score?: number
  timeLeft?: number
  comboCount?: number
  onOpenSettings: () => void
  gameActive: boolean
  theme?: string
  objectivesCompleted?: number
  totalObjectives?: number
  foundWordsCount?: number
  onShowObjectives: () => void
  onShowFoundWords: () => void
  onShowShareModal: () => void
  onResetGame: () => void
  isMobile?: boolean
}

export default function CompactTopBar({
  score = 0,
  timeLeft = 120,
  comboCount = 0,
  onOpenSettings,
  gameActive,
  theme = "tropical",
  objectivesCompleted = 0,
  totalObjectives = 3,
  foundWordsCount = 0,
  onShowObjectives,
  onShowFoundWords,
  onShowShareModal,
  onResetGame,
  isMobile = false,
}: CompactTopBarProps) {
  const [showObjectives, setShowObjectives] = useState(false)
  const [showFoundWords, setShowFoundWords] = useState(false)
  const message = useSelector((state: RootState) => state.game.message)

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between gap-2 p-2 bg-sky-900/80 backdrop-blur-sm border-b border-sky-700 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={onShowObjectives}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-sky-800 transition-colors"
            aria-label="Show objectives"
          >
            <Target className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">
              {objectivesCompleted}/{totalObjectives}
            </span>
          </button>
        </div>

        <GameStatus
          score={score}
          timeLeft={timeLeft}
          message={message}
          gameActive={gameActive}
          comboCount={comboCount}
          isMobile={isMobile}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={onShowFoundWords}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-sky-800 transition-colors"
            aria-label="Show found words"
          >
            <BookOpen className="h-4 w-4 text-sky-300" />
            <span className="text-sm font-medium">{foundWordsCount}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="p-1 rounded hover:bg-sky-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 text-sky-300" />
            </button>

            <button
              onClick={onResetGame}
              className="p-1 rounded hover:bg-sky-800 transition-colors"
              aria-label="Reset game"
            >
              <RotateCcw className="h-4 w-4 text-sky-300" />
            </button>

            <button
              onClick={onShowShareModal}
              className="p-1 rounded hover:bg-sky-800 transition-colors"
              aria-label="Share results"
            >
              <Share2 className="h-4 w-4 text-sky-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Objectives Panel */}
      {showObjectives && (
        <div
          id="objectives-panel"
          className="absolute top-full left-0 w-full z-10 bg-sky-900/95 backdrop-blur-sm border-b border-sky-700 shadow-lg"
        >
          <div className="p-3 max-h-60 overflow-y-auto">
            {/* Objectives content would go here */}
            <p className="text-sky-200">Objectives panel content</p>
          </div>
        </div>
      )}

      {/* Found Words Panel */}
      {showFoundWords && (
        <div
          id="found-words-panel"
          className="absolute top-full left-0 w-full z-10 bg-sky-900/95 backdrop-blur-sm border-b border-sky-700 shadow-lg"
        >
          <div className="p-3 max-h-60 overflow-y-auto">
            {/* Found words content would go here */}
            <p className="text-sky-200">Found words panel content</p>
          </div>
        </div>
      )}
    </div>
  )
}
