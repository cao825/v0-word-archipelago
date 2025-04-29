"use client"

import { useState } from "react"
import { validateWord } from "../lib/services/dictionaryService"
import CollapsiblePanel from "./collapsible-panel"
import WordValidatorDebug from "./word-validator-debug"
import DictionaryTester from "./dictionary-tester"
import ObjectiveDebugPanel from "./objective-debug-panel"

export default function DictionaryDebug() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)

  const checkWord = () => {
    if (!word) return
    const isValid = validateWord(word.toLowerCase())
    setResult(isValid ? "Valid word!" : "Not a valid word.")
  }

  return (
    <div className="space-y-4 mt-4">
      <CollapsiblePanel title="Dictionary Debug" defaultOpen={false}>
        <div className="p-4 bg-gray-800 rounded-md">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded flex-1"
              placeholder="Enter a word to check"
            />
            <button onClick={checkWord} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Check
            </button>
          </div>
          {result && (
            <div
              className={`p-3 rounded ${
                result === "Valid word!"
                  ? "bg-green-800/50 border border-green-700"
                  : "bg-red-800/50 border border-red-700"
              }`}
            >
              {result}
            </div>
          )}
        </div>
      </CollapsiblePanel>

      <WordValidatorDebug />
      <DictionaryTester />
      <ObjectiveDebugPanel />
    </div>
  )
}
