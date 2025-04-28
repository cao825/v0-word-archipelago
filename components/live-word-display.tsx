"use client"

import { motion, AnimatePresence } from "framer-motion"

interface LiveWordDisplayProps {
  currentWord: string
  isValid: boolean
  invalidSubmission: boolean
  duplicateSubmission: boolean
}

export default function LiveWordDisplay({
  currentWord,
  isValid,
  invalidSubmission,
  duplicateSubmission,
}: LiveWordDisplayProps) {
  // Determine text color based on validity
  const getTextColor = () => {
    if (invalidSubmission) return "text-red-500"
    if (duplicateSubmission) return "text-amber-500"
    if (currentWord.length >= 2) {
      return isValid ? "text-emerald-400" : "text-red-400"
    }
    return "text-white"
  }

  return (
    <div className="h-10 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {currentWord ? (
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`font-mono font-bold text-xl tracking-wider ${getTextColor()}`}
          >
            {currentWord}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="text-sm text-slate-400 italic"
          >
            Select islands to form words
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
