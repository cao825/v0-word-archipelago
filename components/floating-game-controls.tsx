"use client"

import { useState } from "react"
import { Play, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingGameControlsProps {
  onStartGame: () => void
  onResetGame: () => void
  onOpenSettings: () => void
  gameActive: boolean
}

export default function FloatingGameControls({ onStartGame, onResetGame, gameActive }: FloatingGameControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStartGame = () => {
    onStartGame()
    setIsExpanded(false)
  }

  // If game is active, show only a minimal reset button
  if (gameActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.7, scale: 1 }}
        whileHover={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <button
          onClick={onResetGame}
          className="h-10 w-10 rounded-full bg-slate-800/80 border border-slate-700 text-white hover:bg-slate-700 shadow-md flex items-center justify-center"
          title="Reset Game"
        >
          <RotateCcw size={16} />
        </button>
      </motion.div>
    )
  }

  // If game is not active, show the start button prominently
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.15 }}
            className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg p-3 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-white">Start Game</span>
              <button
                className="h-5 w-5 text-slate-300 hover:bg-slate-700 rounded-full flex items-center justify-center"
                onClick={() => setIsExpanded(false)}
              >
                <RotateCcw size={12} />
              </button>
            </div>

            <button
              onClick={handleStartGame}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1 py-2 px-4 rounded-md shadow-sm"
            >
              <Play size={16} />
              Start 2-Minute Game
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={handleStartGame}
              className="bg-amber-500 hover:bg-amber-600 text-white h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
              aria-label="Start Game"
            >
              <Play size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
