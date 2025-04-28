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

  // Track previous word for animation
  useEffect(() => {
    if (currentWord !== prevWord) {
      setPrevWord(currentWord)
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
      <CardContent className="p-4">
        <div className="flex flex-col items-center justify-center">
          <div className="relative h-16 flex items-center justify-center">
            {currentWord ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWord}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`text-4xl font-bold tracking-wider ${getTextColor()}`}
                >
                  {currentWord}
                </motion.div>
              </AnimatePresence>
            ) : (
              <span className="text-xl text-sky-300 italic">Select islands to form a word</span>
            )}
          </div>

          {/* Invalid submission message */}
          <AnimatePresence>
            {showInvalidMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-300 text-sm mt-2"
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
