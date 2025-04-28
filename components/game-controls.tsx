"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface GameControlsProps {
  onStartGame: () => void
  onResetGame: () => void
}

export default function GameControls({ onStartGame, onResetGame }: GameControlsProps) {
  return (
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onStartGame}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-md py-6 text-lg"
          >
            Start 2-Minute Game
          </Button>
          <Button
            onClick={onResetGame}
            variant="outline"
            className="flex-1 border-sky-300 bg-sky-700 text-white hover:bg-sky-600"
          >
            Reset Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
