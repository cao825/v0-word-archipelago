import { CheckCircle2, Circle } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"

interface ObjectivesListProps {
  objectives: Objective[]
}

export default function ObjectivesList({ objectives }: ObjectivesListProps) {
  const completedCount = objectives.filter((obj) => obj.completed).length

  return (
    <div className="space-y-2">
      <div className="mb-2 text-sky-200 text-sm">
        {completedCount} of {objectives.length} objectives completed
      </div>

      {objectives.map((objective) => (
        <div
          key={objective.id}
          className={`flex items-start gap-2 p-2 rounded-md ${
            objective.completed
              ? "bg-amber-500/20 border border-amber-500/30"
              : "bg-sky-700/40 border border-sky-600/30"
          }`}
        >
          {objective.completed ? (
            <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Circle className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <span className={`${objective.completed ? "text-amber-100" : "text-sky-100"} text-sm`}>
              {objective.description}
            </span>
            {objective.completed && <div className="mt-1 text-xs text-amber-300 font-medium">+50 points</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
