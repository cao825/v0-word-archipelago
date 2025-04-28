"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector, useAppDispatch } from "@/lib/hooks/hooks"
import { hidePointsAnimation } from "@/lib/slices/gameSlice"

export default function PointsAnimation() {
  const { pointsAnimation, comboCount } = useAppSelector((state) => state.game)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (pointsAnimation.isVisible) {
      const timer = setTimeout(() => {
        dispatch(hidePointsAnimation())
      }, 1000) // Reduced from 1500ms

      return () => clearTimeout(timer)
    }
  }, [pointsAnimation.isVisible, dispatch])

  return (
    <AnimatePresence>
      {pointsAnimation.isVisible && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: -30 }} // Reduced y-offset
          exit={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.4, type: "spring", damping: 15 }} // Faster animation
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 drop-shadow-lg">+{pointsAnimation.points}</div>
            {comboCount >= 3 && (
              <motion.div
                className="text-base font-bold text-white mt-1 bg-amber-600/80 px-2 py-0.5 rounded-md"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.05 }}
                transition={{
                  repeat: 1, // Reduced from 2
                  repeatType: "reverse",
                  duration: 0.2, // Faster animation
                }}
              >
                COMBO x{comboCount}!
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
