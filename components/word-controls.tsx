"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WordControlsProps {
  currentWord: string
  selectedIslands: string[]
  onSubmitWord: () => void
  onResetSelection: () => void
}

export default function WordControls({
  currentWord,
  selectedIslands,
  onSubmitWord,
  onResetSelection,
}: WordControlsProps) {
  return (
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="bg-sky-900/80 rounded-md p-3 text-xl font-bold text-white min-h-[2.5rem] flex items-center justify-center border border-sky-700 flex-1">
            {currentWord || "Select islands"}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onSubmitWord}
              disabled={selectedIslands.length < 2}
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-md"
            >
              Submit
            </Button>
            <Button
              onClick={onResetSelection}
              variant="outline"
              disabled={selectedIslands.length === 0}
              className="border-sky-300 bg-sky-700 text-white hover:bg-sky-600"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
