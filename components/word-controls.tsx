"use client"

import { Check, X } from "lucide-react"

interface WordControlsProps {
  currentWord: string
  selectedIslands: string[]
  onSubmitWord: () => void
  onResetSelection: () => void
  isMobile?: boolean
}

export default function WordControls({
  currentWord,
  selectedIslands,
  onSubmitWord,
  onResetSelection,
  isMobile = false,
}: WordControlsProps) {
  const hasSelection = selectedIslands.length > 0

  return (
    <div className="flex justify-center gap-4 h-10 transition-all duration-300">
      <button
        onClick={onSubmitWord}
        disabled={!hasSelection}
        className={`flex items-center justify-center gap-1 px-4 rounded-full transition-colors ${
          hasSelection
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "bg-slate-700/50 text-slate-400 cursor-not-allowed"
        }`}
        aria-label="Submit word"
      >
        <Check size={isMobile ? 16 : 18} />
        <span className={isMobile ? "text-sm" : ""}>Submit</span>
      </button>

      <button
        onClick={onResetSelection}
        disabled={!hasSelection}
        className={`flex items-center justify-center gap-1 px-4 rounded-full transition-colors ${
          hasSelection ? "bg-red-600 hover:bg-red-700 text-white" : "bg-slate-700/50 text-slate-400 cursor-not-allowed"
        }`}
        aria-label="Clear selection"
      >
        <X size={isMobile ? 16 : 18} />
        <span className={isMobile ? "text-sm" : ""}>Clear</span>
      </button>
    </div>
  )
}
