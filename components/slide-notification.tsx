"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"

type NotificationType = "success" | "warning" | "info"

interface SlideNotificationProps {
  message: string
  type?: NotificationType
  duration?: number
  isVisible: boolean
  onClose: () => void
}

export default function SlideNotification({
  message,
  type = "info",
  duration = 3000,
  isVisible,
  onClose,
}: SlideNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={14} className="text-green-400" />
      case "warning":
        return <AlertTriangle size={14} className="text-amber-400" />
      case "info":
        return <Clock size={14} className="text-sky-400" />
      default:
        return <CheckCircle size={14} className="text-green-400" />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        >
          <div
            className={`mt-2 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-medium ${
              type === "success" ? "bg-green-600/90" : type === "warning" ? "bg-amber-600/90" : "bg-sky-600/90"
            } text-white backdrop-blur-sm`}
          >
            {getIcon()}
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
