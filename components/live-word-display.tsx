"use client"

import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg overflow-hidden">
      <CardContent className="p-3">
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-16 flex items-center justify-center">
            {currentWord ? (
              <div className="flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {letters.map((letter, index) => (
                    <motion.span
                      key={`${index}-${letter}`}
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.15, delay: index * 0.05 }}
                      className={`text-4xl font-bold tracking-wider ${getTextColor()}`}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="h-10"></div> // Empty space holder when no word is selected
            )}
          </div>

          {/* Invalid submission message */}
          <AnimatePresence>
            {showInvalidMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-300 text-xs mt-1"
              >
                {duplicateSubmission ? "You've already found this word!" : "Not a valid word!"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
