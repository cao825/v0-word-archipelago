"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface PointsAnimationProps {
  points: number
  isVisible: boolean
  onComplete: () => void
}

export default function PointsAnimation({ points, isVisible, onComplete }: PointsAnimationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete()
      }, 1200)

      return () => {
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally keyed on isVisible only. onComplete is a fire-once completion callback; including it would re-run the effect (clearing/resetting the 1200ms timer) on every parent re-render, so the animation could never complete.
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && points > 0 && (
        <motion.div
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{
              scale: 1.2,
              y: -20,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            }}
            exit={{
              scale: 1.3,
              y: -60,
              opacity: 0,
              transition: {
                duration: 0.6,
                ease: "easeIn",
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
