import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"

interface ObjectivesListProps {
  objectives: Objective[]
}

export default function ObjectivesList({ objectives }: ObjectivesListProps) {
  return (
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-base text-white flex justify-between items-center">
          <span className="font-light tracking-wide">OBJECTIVES</span>
          <span className="text-xs bg-amber-500/20 px-2 py-1 rounded-md text-amber-300 font-normal">+50 pts each</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {objectives.map((objective) => (
            <li
              key={objective.id}
              className={`flex items-start gap-2 p-2 rounded-md ${
                objective.completed
                  ? "bg-amber-500/20 border border-amber-500/30"
                  : "bg-sky-900/50 border border-sky-800"
              }`}
            >
              {objective.completed ? (
                <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
              )}
              <span className={`text-sm ${objective.completed ? "text-amber-100" : "text-sky-100"}`}>
                {objective.description}
              </span>
              {objective.completed && <span className="ml-auto text-xs text-amber-400">+50</span>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
