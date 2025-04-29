"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

export function ObjectiveProgress() {
  const objectives = useSelector((state: RootState) => state.game.objectives)
  const completedObjectives = useSelector((state: RootState) => state.game.completedObjectives)

  const totalObjectives = objectives.length
  const completedCount = completedObjectives.length
  const progressPercentage = totalObjectives > 0 ? Math.round((completedCount / totalObjectives) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs font-medium whitespace-nowrap">
        {completedCount}/{totalObjectives}
      </div>
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
