"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface WordFoundToastProps {
  word: string
  points: number
  isVisible: boolean
  onClose: () => void
  comboCount?: number
  multiplier?: number
}

export default function WordFoundToast({
  word,
  points,
  isVisible,
  onClose,
  comboCount = 0,
  multiplier = 1,
}: WordFoundToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  // Determine if we should show bonus information
  const showComboBonus = comboCount >= 3
  const showMultiplier = multiplier > 1

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="bg-sky-800/90 backdrop-blur-md border border-sky-700 px-3 py-1.5 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">
                Found: <span className="font-bold">{word}</span>
              </span>
              <span className="text-amber-400 text-sm font-bold">+{points} pts</span>
              {showComboBonus && <span className="text-emerald-400 text-xs font-medium">{comboCount}x combo!</span>}
              {showMultiplier && !showComboBonus && (
                <span className="text-emerald-400 text-xs font-medium">{multiplier}x multiplier!</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
