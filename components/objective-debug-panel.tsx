"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../lib/store"
import { checkWordAgainstObjective, checkObjectives } from "../lib/utils/objectiveGenerator"
import CollapsiblePanel from "./collapsible-panel"

export default function ObjectiveDebugPanel() {
  const [testWord, setTestWord] = useState("")
  const [results, setResults] = useState<any[]>([])
  const objectives = useSelector((state: RootState) => state.game.objectives)
  const completedObjectives = useSelector((state: RootState) => state.game.completedObjectives)
  const debugInfo = useSelector((state: RootState) => state.game.debugInfo)

  const testObjectives = () => {
    if (!testWord) return

    const testResults = objectives.map((objective) => {
      const result = checkWordAgainstObjective(testWord, objective)
      return {
        id: objective.id,
        type: objective.type,
        parameter: objective.parameter,
        description: objective.description,
        completed: completedObjectives.includes(objective.id),
        testResult: result,
      }
    })

    const newlyCompleted = checkObjectives(testWord, objectives, completedObjectives)

    setResults([
      ...testResults,
      {
        id: "summary",
        type: "summary",
        description: `Summary: Would complete ${newlyCompleted.length} new objectives`,
        parameter: "N/A",
        completed: false,
        testResult: newlyCompleted.length > 0,
        completedIds: newlyCompleted,
      },
    ])
  }

  return (
    <CollapsiblePanel title="Objective Debug" defaultOpen={false}>
      <div className="space-y-4 p-2 bg-gray-800 rounded-md">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Test Word Against Objectives</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={testWord}
              onChange={(e) => setTestWord(e.target.value)}
              className="px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded"
              placeholder="Enter a word to test"
            />
            <button onClick={testObjectives} className="px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded">
              Test
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">Test Results</h3>
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-2 rounded text-xs ${
                    result.testResult
                      ? "bg-green-800/50 border border-green-700/50"
                      : "bg-gray-700/50 border border-gray-600/50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{result.type === "summary" ? "Summary" : `${result.type}: ${result.parameter}`}</span>
                    <span>{result.testResult ? "✓ Matches" : "✗ No Match"}</span>
                  </div>
                  <div className="text-gray-400 mt-1">{result.description}</div>
                  <div className="text-gray-400 mt-1">ID: {result.id}</div>
                  {result.completed && <div className="text-amber-400 mt-1">Already completed</div>}
                  {result.type === "summary" && result.completedIds && (
                    <div className="text-green-400 mt-1">
                      Would complete objectives: {result.completedIds.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Last Word Check</h3>
          <div className="bg-gray-700/50 border border-gray-600/50 p-2 rounded text-xs">
            <div>
              Word: <span className="text-white">{debugInfo.lastWord || "None"}</span>
            </div>
            {debugInfo.lastObjectiveCheck && (
              <>
                <div className="mt-1">Objectives checked:</div>
                <pre className="mt-1 overflow-x-auto max-h-32 text-xs">
                  {JSON.stringify(debugInfo.lastObjectiveCheck, null, 2)}
                </pre>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">Current Objectives</h3>
          <div className="space-y-2">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className={`p-2 rounded text-xs ${
                  completedObjectives.includes(obj.id)
                    ? "bg-amber-800/50 border border-amber-700/50"
                    : "bg-gray-700/50 border border-gray-600/50"
                }`}
              >
                <div>
                  Type: <span className="text-white">{obj.type}</span>
                </div>
                <div>
                  Parameter: <span className="text-white">{obj.parameter}</span>
                </div>
                <div>
                  Description: <span className="text-white">{obj.description}</span>
                </div>
                <div>
                  ID: <span className="text-white">{obj.id}</span>
                </div>
                <div>
                  Completed: <span className="text-white">{completedObjectives.includes(obj.id) ? "Yes" : "No"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  )
}
