"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play } from "lucide-react"

interface GameNotificationProps {
  isVisible: boolean
  onClose: () => void
  message: string
  duration?: number
}

export default function GameNotification({ isVisible, onClose, message, duration = 3000 }: GameNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-sky-800/90 backdrop-blur-md border border-sky-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="bg-amber-500 rounded-full p-2 flex-shrink-0">
              <Play size={16} className="text-white" />
            </div>
            <p className="text-white text-sm font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
