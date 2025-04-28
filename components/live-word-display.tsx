"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { validateWord } from "@/lib/utils/wordValidator"
import { couldBeValidWord } from "@/lib/services/dictionaryService"

interface LiveWordDisplayProps {
  currentWord: string
  isValid: boolean
  invalidSubmission?: boolean
  duplicateSubmission?: boolean
}

export default function LiveWordDisplay({
  currentWord,
  isValid,
  invalidSubmission = false,
  duplicateSubmission = false,
}: LiveWordDisplayProps) {
  const [prevWord, setPrevWord] = useState("")
  const [showInvalidMessage, setShowInvalidMessage] = useState(false)
  const [wordStatus, setWordStatus] = useState<"valid" | "invalid" | "potential" | "empty">("empty")
  const [letters, setLetters] = useState<string[]>([])

  // Track previous word for animation
  useEffect(() => {
    if (currentWord !== prevWord) {
      setPrevWord(currentWord)
      setLetters(currentWord.split(""))
    }
  }, [currentWord, prevWord])

  // Show invalid message when submission is invalid
  useEffect(() => {
    if (invalidSubmission || duplicateSubmission) {
      setShowInvalidMessage(true)
      const timer = setTimeout(() => {
        setShowInvalidMessage(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [invalidSubmission, duplicateSubmission])

  // Determine word status for styling
  useEffect(() => {
    if (!currentWord) {
      setWordStatus("empty")
    } else if (validateWord(currentWord)) {
      setWordStatus("valid")
    } else if (couldBeValidWord(currentWord)) {
      setWordStatus("potential")
    } else {
      setWordStatus("invalid")
    }
  }, [currentWord])

  // Get text color based on word status
  const getTextColor = () => {
    switch (wordStatus) {
      case "valid":
        return "text-white"
      case "potential":
        return "text-amber-300"
      case "invalid":
        return "text-red-300"
      default:
        return "text-white"
    }
  }

  return (
    <div className="bg-sky-900/80 backdrop-blur-sm border-b border-sky-700 py-2 sticky top-12 z-20 h-12 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center h-full relative">
        <div className="h-6 flex items-center justify-center min-h-[24px]">
          {currentWord ? (
            <div className="flex items-center justify-center">
              <AnimatePresence mode="wait">
                {letters.map((letter, index) => (
                  <motion.span
                    key={`${index}-${letter}`}
                    initial={{ opacity: 0, y: -5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.9 }}
                    transition={{ duration: 0.15, delay: index * 0.05 }}
                    className={`text-xl font-bold tracking-wider ${getTextColor()}`}
                  >
                    {letter}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-6 w-8 opacity-0">A</div> // Invisible placeholder to maintain height
          )}
        </div>

        {/* Message container with fixed height */}
        <div className="h-4 min-h-[16px] flex items-center justify-center">
          <AnimatePresence>
            {showInvalidMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-300 text-xs"
              >
                {duplicateSubmission ? "Already found!" : "Not a valid word!"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
