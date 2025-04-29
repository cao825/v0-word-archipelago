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

  // Determine color based on points value
  const getColor = () => {
    if (points >= 20) return "#10b981" // Green for high points
    if (points >= 10) return "#3b82f6" // Blue for medium points
    return "#ffffff" // White for regular points
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -30, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8 }}
          className="absolute pointer-events-none z-50 font-bold text-2xl"
          style={{
            color: getColor(),
            left: "50%",
            top: "40%",
            transform: "translateX(-50%)",
            textShadow: "0px 0px 4px rgba(0,0,0,0.7)",
          }}
        >
          +{points}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PointsAnimation
