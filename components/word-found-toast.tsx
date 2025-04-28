"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface WordFoundToastProps {
  word: string
  points: number
  isVisible: boolean
  onClose: () => void
}

export default function WordFoundToast({ word, points, isVisible, onClose }: WordFoundToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none" // Changed from z-30 to z-40 and bottom-4 to bottom-16 for better visibility
        >
          <div className="bg-sky-800/95 backdrop-blur-md border border-sky-700 px-4 py-2 rounded-full shadow-lg">
            {" "}
            {/* Increased opacity and padding */}
            <div className="flex items-center gap-3">
              {" "}
              {/* Increased gap from 2 to 3 */}
              <span className="text-white text-base font-medium">
                {" "}
                {/* Increased from text-sm to text-base */}
                Found: <span className="font-bold">{word}</span>
              </span>
              <span className="text-amber-400 text-base font-bold">+{points} pts</span>{" "}
              {/* Increased from text-sm to text-base */}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
