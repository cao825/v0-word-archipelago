"use client"

import { useState } from "react"
import { Play, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingGameControlsProps {
  onStartGame: () => void
  onResetGame: () => void
  gameActive: boolean
}

export default function FloatingGameControls({ onStartGame, onResetGame, gameActive }: FloatingGameControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStartGame = () => {
    onStartGame()
    setIsExpanded(false)
  }

  const handleResetGame = () => {
    onResetGame()
    setIsExpanded(false)
  }

  // If game is active, don't show the controls
  if (gameActive) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-sky-800 border border-sky-700 rounded-lg shadow-lg p-3 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white">Game Controls</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-sky-300 hover:bg-sky-700"
                onClick={() => setIsExpanded(false)}
              >
                <X size={14} />
              </Button>
            </div>

            <Button
              onClick={handleStartGame}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
              size="sm"
            >
              <Play size={14} />
              Start 2-Minute Game
            </Button>

            <Button
              onClick={handleResetGame}
              variant="outline"
              className="border-sky-300 bg-sky-700 text-white hover:bg-sky-600 flex items-center gap-2"
              size="sm"
            >
              <RefreshCw size={14} />
              Reset Game
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white h-12 w-12 rounded-full shadow-lg"
            >
              <Play size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
