"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award } from "lucide-react"

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -10, x: "-50%" }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-28 left-1/2 z-40 pointer-events-none"
        >
          <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Award size={18} className="text-white" />
            <span className="font-medium">{title}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
