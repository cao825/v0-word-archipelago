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
  // `displayWord` is derived directly from the `currentWord` prop — no local
  // state/effect mirror needed (the prop change already re-renders the component).
  const displayWord = currentWord

  // Determine text color based on validity
  const getTextColor = () => {
    if (invalidSubmission) return "text-red-500"
    if (duplicateSubmission) return "text-amber-500"
    if (displayWord.length >= 2) {
      return isValid ? "text-emerald-400" : "text-red-400"
    }
    return "text-white"
  }

  return (
    <div className="h-8 flex items-center justify-center transition-all duration-300">
      <AnimatePresence mode="wait">
        {displayWord ? (
          <motion.div
            key={displayWord}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`font-mono font-bold text-lg tracking-wider ${getTextColor()}`}
          >
            {displayWord}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="text-xs text-slate-400 italic"
          >
            Select islands to form words
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
