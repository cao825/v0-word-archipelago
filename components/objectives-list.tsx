import { CheckCircle2, Circle } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"

interface ObjectivesListProps {
  objectives: Objective[]
}

export default function ObjectivesList({ objectives }: ObjectivesListProps) {
  const completedCount = objectives.filter((obj) => obj.completed).length

  return (
    <div className="space-y-1.5">
      {objectives.map((objective) => (
        <div
          key={objective.id}
          className={`flex items-start gap-1.5 p-1.5 rounded-md text-xs ${
            objective.completed ? "bg-amber-500/20 border border-amber-500/30" : "bg-sky-900/50 border border-sky-800"
          }`}
        >
          {objective.completed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
          )}
          <span className={`${objective.completed ? "text-amber-100" : "text-sky-100"}`}>{objective.description}</span>
          {objective.completed && <span className="ml-auto text-xs text-amber-400">+50</span>}
        </div>
      ))}
    </div>
  )
}
