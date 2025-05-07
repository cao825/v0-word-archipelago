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
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-md mx-auto pointer-events-auto px-4 sm:px-0"
            >
              <div className="bg-sky-800/90 backdrop-blur-md border border-sky-700 rounded-lg shadow-lg w-full">
                <div className="flex items-center justify-between p-3 border-b border-sky-700 w-full">
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
                <div className="p-3 w-full max-h-[calc(80vh-60px)] overflow-visible">{children}</div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
