"use client"

import { Button } from "@/components/ui/button"
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
  return (
    <div className="flex justify-center gap-2 mt-1">
      <Button
        onClick={onSubmitWord}
        disabled={selectedIslands.length < 2}
        className="bg-amber-500 hover:bg-amber-600 text-white shadow-md h-8 px-3 rounded-full"
        size="sm"
      >
        <Check size={14} className="mr-1" />
        <span className="text-xs">Submit</span>
      </Button>
      <Button
        onClick={onResetSelection}
        variant="outline"
        disabled={selectedIslands.length === 0}
        className="border-sky-300 bg-sky-700 text-white hover:bg-sky-600 h-8 px-3 rounded-full"
        size="sm"
      >
        <X size={14} className="mr-1" />
        <span className="text-xs">Clear</span>
      </Button>
    </div>
  )
}
