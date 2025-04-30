"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface PointsAnimationProps {
  points: number
  isVisible: boolean
  onComplete: () => void
}

export default function PointsAnimation({ points, isVisible, onComplete }: PointsAnimationProps) {
  // Call onComplete after animation finishes
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete()
      }, 1500) // Match this to the animation duration

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && points > 0 && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
            initial={{ scale: 0.5, y: 50 }}
            animate={{
              scale: 1.2,
              y: -20,
              transition: {
                duration: 0.5,
                ease: "easeOut",
              },
            }}
            exit={{
              scale: 1.5,
              y: -100,
              opacity: 0,
              transition: {
                duration: 1,
                ease: "easeOut",
              },
            }}
          >
            +{points}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
