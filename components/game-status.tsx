import { Card, CardContent } from "@/components/ui/card"

interface GameStatusProps {
  score: number
  timeLeft: number
  message: string
  gameActive: boolean
}

export default function GameStatus({ score, timeLeft, message, gameActive }: GameStatusProps) {
  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Card className="flex-1 sm:flex-none bg-sky-800/80 border-sky-700 shadow-lg">
          <CardContent className="p-3 flex flex-col items-center">
            <span className="text-xs uppercase font-light tracking-wider text-sky-200">Score</span>
            <span className="text-2xl font-bold text-amber-400">{score}</span>
          </CardContent>
        </Card>

        <Card
          className={`flex-1 sm:flex-none bg-sky-800/80 border-sky-700 shadow-lg ${
            timeLeft < 30 ? "border-red-500" : ""
          }`}
        >
          <CardContent className="p-3 flex flex-col items-center">
            <span className="text-xs uppercase font-light tracking-wider text-sky-200">Time</span>
            <span className={`text-2xl font-bold ${timeLeft < 30 ? "text-red-400" : "text-white"}`}>
              {formattedTime}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="bg-sky-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-md border border-sky-700 w-full sm:w-auto text-center shadow-lg">
        {message}
      </div>
    </div>
  )
}
