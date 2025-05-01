"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector, useAppDispatch } from "@/lib/hooks/hooks"
import { hideObjectiveNotification } from "@/lib/slices/gameSlice"
import { CheckCircle } from "lucide-react"

export default function ObjectiveCompleteNotification() {
  const dispatch = useAppDispatch()
  const objectiveCompletionNotification = useAppSelector((state) => state.game.objectiveCompletionNotification)
  const objectives = useAppSelector((state) => state.game.objectives)
  const completedObjectives = useAppSelector((state) => state.game.completedObjectives)

  const [isVisible, setIsVisible] = useState(false)
  const [count, setCount] = useState(0)

  // Add a ref to track if we've already shown a notification for all objectives
  const allObjectivesNotifiedRef = useRef(false)
  const totalObjectives = objectives.length

  // Find the completed objective descriptions
  const completedObjectiveDescriptions = objectives
    .filter((obj) => objectiveCompletionNotification.completedObjectiveIds.includes(obj.id))
    .map((obj) => obj.description)

  useEffect(() => {
    if (objectiveCompletionNotification.isVisible && objectiveCompletionNotification.completedObjectiveIds.length > 0) {
      // Verify that these objectives are actually completed
      const verifiedIds = objectiveCompletionNotification.completedObjectiveIds.filter((id) =>
        completedObjectives.includes(id),
      )

      // Only show notification if there are verified completed objectives
      if (verifiedIds.length > 0) {
        setIsVisible(true)
        setCount(verifiedIds.length)

        // Hide after delay
        const timer = setTimeout(() => {
          setIsVisible(false)
          dispatch(hideObjectiveNotification())
        }, 3000)

        return () => clearTimeout(timer)
      } else {
        // If no verified objectives, hide the notification
        dispatch(hideObjectiveNotification())
      }
    } else {
      setIsVisible(false)
    }
  }, [objectiveCompletionNotification, completedObjectives, dispatch])

  // Check if all objectives are completed
  useEffect(() => {
    if (completedObjectives.length === totalObjectives) {
      allObjectivesNotifiedRef.current = true
    } else {
      allObjectivesNotifiedRef.current = false
    }
  }, [completedObjectives.length, totalObjectives])

  // Only show notification if there are new completed objectives and not showing "all completed" repeatedly
  const shouldShowNotification =
    isVisible && count > 0 && (completedObjectiveDescriptions.length > 0 || !allObjectivesNotifiedRef.current)

  return (
    <AnimatePresence>
      {shouldShowNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <div>
              <span className="font-medium">
                {count} Objective{count > 1 ? "s" : ""} Completed! +{count * 50} points
              </span>
              {completedObjectiveDescriptions.length > 0 && (
                <ul className="text-xs mt-1 font-normal">
                  {completedObjectiveDescriptions.map((desc, i) => (
                    <li key={i}>• {desc}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
