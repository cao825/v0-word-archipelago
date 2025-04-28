"use client"

import type React from "react"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModalOverlayProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function ModalOverlay({ isOpen, onClose, title, children }: ModalOverlayProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-sky-950/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-x-4 top-1/4 z-50 max-w-md mx-auto"
          >
            <div className="bg-sky-800/90 backdrop-blur-md border border-sky-700 rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-sky-700">
                <h3 className="text-sm font-medium text-white">{title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-sky-200 hover:bg-sky-700 hover:text-white"
                  onClick={onClose}
                >
                  <X size={16} />
                </Button>
              </div>
              <div className="p-3 max-h-[60vh] overflow-y-auto">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
