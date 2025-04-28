"use client"

import type React from "react"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PointsAnimationProps {
  points: number
  isVisible: boolean
  onComplete: () => void
}

export const PointsAnimation: React.FC<PointsAnimationProps> = ({ points, isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [onComplete, isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -30 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute pointer-events-none z-50 font-bold text-lg"
          style={{
            color: points > 5 ? "#10b981" : points > 3 ? "#3b82f6" : "#ffffff",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          +{points}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PointsAnimation
