"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../lib/store"
import { checkWordAgainstObjective } from "../lib/utils/objectiveGenerator"

/**
 * Debug component for testing words against objectives
 */
export default function ObjectiveDebug() {
  const [testWord, setTestWord] = useState("")
  const [results, setResults] = useState<Record<string, boolean>>({})
  const objectives = useSelector((state: RootState) => state.game.objectives)

  /**
   * Tests the current word against all objectives and updates the results
   */
  const testObjectives = () => {
    if (!testWord) return

    const newResults: Record<string, boolean> = {}

    // Test against each objective
    objectives.forEach((objective) => {
      newResults[objective.id] = checkWordAgainstObjective(testWord, objective)
    })

    setResults(newResults)
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-white mb-4">Objective Debug Tool</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={testWord}
          onChange={(e) => setTestWord(e.target.value)}
          placeholder="Enter a word to test"
          className="px-3 py-2 rounded bg-gray-700 text-white"
        />
        <button
          onClick={testObjectives}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Test
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-white font-semibold">Results for &ldquo;{testWord}&rdquo;:</h4>

          {objectives.map((objective) => (
            <div key={objective.id} className={`p-2 rounded ${results[objective.id] ? "bg-green-800" : "bg-red-800"}`}>
              <div className="text-white">
                <span className="font-medium">{objective.description}</span>
                <span className="ml-2">{results[objective.id] ? "✓ Completed" : "✗ Not Completed"}</span>
              </div>
              <div className="text-gray-300 text-sm">
                Type: {objective.type}, Parameter: {objective.parameter.toString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
