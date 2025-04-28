"use client"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MiniAchievementProps {
  title: string
  isVisible: boolean
  onClose: () => void
}

export default function MiniAchievement({ title, isVisible, onClose }: MiniAchievementProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!title || !isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
