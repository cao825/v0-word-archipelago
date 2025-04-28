import { Card, CardContent } from "@/components/ui/card"

interface GameStatusProps {
  score: number
  timeLeft: number
  message: string
  gameActive: boolean
  comboCount?: number
}

export default function GameStatus({ score, timeLeft, message, gameActive, comboCount = 0 }: GameStatusProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div className="flex items-center gap-2 flex-1">
      <Card className="flex-none bg-sky-800/80 border-sky-700 shadow-lg">
        <CardContent className="p-2 flex flex-col items-center">
          <span className="text-xs uppercase font-light tracking-wider text-sky-200">Score</span>
          <span className="text-xl font-bold text-amber-400">{score}</span>
        </CardContent>
      </Card>

      <Card className={`flex-none bg-sky-800/80 border-sky-700 shadow-lg ${timeLeft < 30 ? "border-red-500" : ""}`}>
        <CardContent className="p-2 flex flex-col items-center">
          <span className="text-xs uppercase font-light tracking-wider text-sky-200">Time</span>
          <span
            className={`text-xl font-bold font-mono w-[3.5rem] text-center ${timeLeft < 30 ? "text-red-400" : "text-white"}`}
          >
            {formattedTime}
          </span>
        </CardContent>
      </Card>

      {gameActive && comboCount >= 2 && (
        <Card className="flex-none bg-amber-600/80 border-amber-500 shadow-lg animate-pulse">
          <CardContent className="p-2 flex flex-col items-center">
            <span className="text-xs uppercase font-light tracking-wider text-amber-100">Combo</span>
            <span className="text-xl font-bold text-white">x{comboCount}</span>
          </CardContent>
        </Card>
      )}

      <div className="bg-sky-800/80 backdrop-blur-sm text-white px-3 py-2 rounded-md border border-sky-700 flex-1 text-center shadow-lg text-sm">
        {message}
      </div>
    </div>
  )
}
