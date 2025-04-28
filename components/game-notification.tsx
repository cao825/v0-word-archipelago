"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface GameNotificationProps {
  isVisible?: boolean
  onClose: () => void
  message?: string
}

export default function GameNotification({
  isVisible = false,
  onClose,
  message = "Tap the Play button to start a game!",
}: GameNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 left-0 right-0 mx-auto z-50 w-full max-w-sm"
        >
          <div className="bg-amber-500 text-white px-4 py-3 rounded-lg shadow-lg mx-4 flex items-center justify-between">
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-2 text-amber-100 hover:text-white focus:outline-none"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
