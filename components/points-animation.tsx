"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppSelector, useAppDispatch } from "@/lib/hooks/hooks"
import { hidePointsAnimation } from "@/lib/slices/gameSlice"

export default function PointsAnimation() {
  const { pointsAnimation, comboCount, selectedIslands, islands } = useAppSelector((state) => state.game)
  const dispatch = useAppDispatch()
  const [lastIslandPosition, setLastIslandPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (pointsAnimation.isVisible) {
      const timer = setTimeout(() => {
        dispatch(hidePointsAnimation())
      }, 1000) // Reduced from 1500ms

      return () => clearTimeout(timer)
    }
  }, [pointsAnimation.isVisible, dispatch])

  // Calculate the position of the last selected island
  useEffect(() => {
    if (selectedIslands.length > 0) {
      const lastIslandId = selectedIslands[selectedIslands.length - 1]
      const lastIsland = islands.find((island) => island.id === lastIslandId)

      if (lastIsland) {
        setLastIslandPosition({
          x: lastIsland.position.x,
          y: lastIsland.position.y,
        })
      }
    }
  }, [selectedIslands, islands])

  return (
    <AnimatePresence>
      {pointsAnimation.isVisible && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute transform -translate-x-1/2"
            style={{
              left: `${lastIslandPosition.x}px`,
              top: `${lastIslandPosition.y - 40}px`,
            }}
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: -30 }} // Animate upward
            exit={{ scale: 1.2, opacity: 0, y: -50 }}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
