"use client"

import React from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../lib/store"
import { CheckCircle2, Circle } from "lucide-react"
import type { Objective } from "../lib/utils/objectiveGenerator"

interface ObjectivesListProps {
  objectives: Objective[]
}

export default function ObjectivesList({ objectives }: ObjectivesListProps) {
  const completedObjectives = useSelector((state: RootState) => state.game.completedObjectives)

  // Force re-render when objectives or completedObjectives change
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0)

  // Use effect to force re-render when completedObjectives change
  React.useEffect(() => {
    forceUpdate()
    console.log("[ObjectivesList] Objectives:", objectives)
    console.log("[ObjectivesList] Completed objectives:", completedObjectives)
  }, [objectives, completedObjectives])

  const completedCount = objectives.filter((obj) => completedObjectives.includes(obj.id)).length

  return (
    <div className="space-y-2">
      <div className="mb-2 text-sky-200 text-sm">
        {completedCount} of {objectives.length} objectives completed
      </div>

      {objectives.map((objective) => {
        const isCompleted = completedObjectives.includes(objective.id)
        console.log(`[ObjectivesList] Objective ${objective.id}: ${isCompleted ? "completed" : "not completed"}`)

        return (
          <div
            key={objective.id}
            className={`flex items-start gap-2 p-2 rounded-md ${
              isCompleted ? "bg-amber-500/20 border border-amber-500/30" : "bg-sky-700/40 border border-sky-600/30"
            }`}
            data-testid={`objective-${objective.id}`}
            data-completed={isCompleted}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-sky-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <span className={`${isCompleted ? "text-amber-100" : "text-sky-100"} text-sm`}>
                {objective.description}
              </span>
              {isCompleted && <div className="mt-1 text-xs text-amber-300 font-medium">+50 points</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
