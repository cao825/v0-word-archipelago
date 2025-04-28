"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PillButtonProps {
  label: string
  count: number
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function PillButton({ label, count, children, defaultOpen = false }: PillButtonProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
          isOpen ? "bg-amber-500 text-white" : "bg-sky-800/80 text-sky-100 border border-sky-700"
        }`}
      >
        <span>{label}</span>
        {count > 0 && (
          <span
            className={`px-1.5 py-0.5 rounded-full text-xs ${
              isOpen ? "bg-amber-600 text-white" : "bg-sky-700 text-sky-300"
            }`}
          >
            {count}
          </span>
        )}
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-64 bg-sky-800 border border-sky-700 rounded-md shadow-lg overflow-hidden"
          >
            <div className="p-2 max-h-40 overflow-y-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
