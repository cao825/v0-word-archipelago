"use client"

import type React from "react"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SlideNotificationProps {
  message: string | null
  type?: "success" | "error" | "info"
  duration?: number
  onComplete: () => void
}

export const SlideNotification: React.FC<SlideNotificationProps> = ({
  message,
  type = "info",
  duration = 2000,
  onComplete,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onComplete()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onComplete])

  if (!message) return null

  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg max-w-xs text-center`}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  )
}
