"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg">
      <CardContent className={isMobile ? "p-2" : "p-3"}>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              onClick={onSubmitWord}
              disabled={selectedIslands.length < 2}
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-md h-12"
              size={isMobile ? "sm" : "default"}
            >
              Submit
            </Button>
            <Button
              onClick={onResetSelection}
              variant="outline"
              disabled={selectedIslands.length === 0}
              className="border-sky-300 bg-sky-700 text-white hover:bg-sky-600 h-12"
              size={isMobile ? "sm" : "default"}
            >
              Clear
            </Button>
          </div>

          <div className="text-xs text-sky-200 ml-auto">Double-tap last island to submit</div>
        </div>
      </CardContent>
    </Card>
  )
}
