"use client"

import { useState } from "react"
import { Play, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingGameControlsProps {
  onStartGame: () => void
  onResetGame: () => void
  onOpenSettings: () => void
  gameActive: boolean
}

export default function FloatingGameControls({
  onStartGame,
  onResetGame,
  onOpenSettings,
  gameActive,
}: FloatingGameControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStartGame = () => {
    onStartGame()
    setIsExpanded(false)
  }

  const handleResetGame = () => {
    onResetGame()
    setIsExpanded(false)
  }

  // If game is active, show only a minimal reset button
  if (gameActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <Button
          onClick={onResetGame}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full bg-sky-800/80 border-sky-700 text-white hover:bg-sky-700 shadow-md"
          title="Reset Game"
        >
          <RefreshCw size={16} />
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="bg-sky-800/90 backdrop-blur-sm border border-sky-700 rounded-lg shadow-lg p-2 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-white">Game Controls</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-sky-300 hover:bg-sky-700"
                onClick={() => setIsExpanded(false)}
              >
                <RefreshCw size={12} />
              </Button>
            </div>

            <Button
              onClick={handleStartGame}
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 h-8 text-xs"
              size="sm"
            >
              <Play size={12} />
              Start 2-Minute Game
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
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
