"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CollapsiblePanelProps {
  title: string
  children: React.ReactNode
  badge?: number | string
  defaultOpen?: boolean
}

export default function CollapsiblePanel({ title, children, badge, defaultOpen = false }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-sky-800/80 border border-sky-700 rounded-lg shadow-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-2 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-sky-100">{title}</span>
          {badge && <span className="bg-amber-600/80 text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-sky-300" /> : <ChevronDown size={16} className="text-sky-300" />}
      </button>

      {/* Use a fixed height container with overflow to prevent layout shifts */}
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-40" : "max-h-0"}`}>
        <div className="p-2 pt-0 border-t border-sky-700/50">{children}</div>
      </div>
    </div>
  )
}
