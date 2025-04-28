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
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [pointsAnimation.isVisible, dispatch])

  return (
    <AnimatePresence>
      {pointsAnimation.isVisible && (
        <motion.div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: -50 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <div className="text-5xl font-bold text-amber-400 drop-shadow-lg">+{pointsAnimation.points}</div>
            {comboCount >= 3 && (
              <div className="text-xl font-bold text-white mt-2 bg-amber-600/80 px-3 py-1 rounded-md">
                COMBO x{comboCount}!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
