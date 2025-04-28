"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector } from "@/lib/hooks/hooks"
import { CheckCircle } from "lucide-react"

export default function ObjectiveCompleteNotification() {
  const { completedObjectives, objectives } = useAppSelector((state) => state.game)
  const [showNotification, setShowNotification] = useState(false)
  const [lastCompletedObjective, setLastCompletedObjective] = useState<string | null>(null)
  const [prevCompletedCount, setPrevCompletedCount] = useState(0)

  useEffect(() => {
    // Check if a new objective was completed
    if (completedObjectives.length > prevCompletedCount) {
      // Find the newly completed objective
      const newlyCompletedId = completedObjectives[completedObjectives.length - 1]
      const objective = objectives.find((obj) => obj.id === newlyCompletedId)

      if (objective) {
        setLastCompletedObjective(objective.description)
        setShowNotification(true)

        // Hide notification after 3 seconds
        const timer = setTimeout(() => {
          setShowNotification(false)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }

    // Update the previous count
    setPrevCompletedCount(completedObjectives.length)
  }, [completedObjectives, objectives, prevCompletedCount])

  return (
    <AnimatePresence>
      {showNotification && lastCompletedObjective && (
        <motion.div
          className="fixed top-12 left-0 right-0 flex justify-center items-center z-50 pointer-events-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-white" />
            <span className="font-medium text-sm">Objective Complete!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
