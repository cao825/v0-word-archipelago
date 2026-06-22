"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface WordFoundToastProps {
  word: string
  points: number
  isVisible: boolean
  onClose: () => void
  comboCount: number
  multiplier: number
}

export default function WordFoundToast({
  word,
  points,
  isVisible,
  onClose,
  comboCount,
  multiplier,
}: WordFoundToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 1500)

      return () => {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally keyed on isVisible only. onClose is a fire-once dismiss callback; including it would re-run the effect (clearing/resetting the 1500ms timer) on every parent re-render, so the toast could never auto-close.
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-slate-800/90 text-white px-4 py-3 rounded-lg shadow-lg border border-slate-700 min-w-[200px] text-center">
            <div className="font-bold text-lg mb-1">{word}</div>
            <div className="flex justify-center items-center gap-2">
              <span className="text-emerald-400 font-bold">+{points}</span>

              {comboCount >= 2 && <span className="text-amber-400 text-sm">{comboCount}x combo</span>}

              {multiplier > 1 && <span className="text-blue-400 text-sm">{multiplier}x multiplier</span>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
