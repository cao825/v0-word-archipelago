"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LiveWordDisplayProps {
  currentWord: string
  isValid: boolean
}

export default function LiveWordDisplay({ currentWord, isValid }: LiveWordDisplayProps) {
  const [prevWord, setPrevWord] = useState("")

  // Track previous word for animation
  useEffect(() => {
    if (currentWord !== prevWord) {
      setPrevWord(currentWord)
    }
  }, [currentWord, prevWord])

  return (
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-center">
          <div className="relative h-12 flex items-center justify-center">
            {currentWord ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWord}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`text-3xl font-bold tracking-wider ${isValid ? "text-white" : "text-red-300"}`}
                >
                  {currentWord}
                </motion.div>
              </AnimatePresence>
            ) : (
              <span className="text-xl text-sky-300 italic">Select islands to form a word</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
