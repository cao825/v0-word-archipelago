"use client"

import { useState } from "react"
import { validateWord } from "@/lib/services/dictionaryService"

export default function DictionaryTester() {
  const [wordList, setWordList] = useState<string>("")
  const [results, setResults] = useState<{ word: string; valid: boolean }[]>([])
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 })

  const testWords = () => {
    if (!wordList.trim()) return

    const words = wordList
      .toLowerCase()
      .split(/[\s,;]+/)
      .filter((word) => word.trim().length > 0)

    const newResults = words.map((word) => ({
      word,
      valid: validateWord(word),
    }))

    setResults(newResults)

    const validCount = newResults.filter((r) => r.valid).length
    setStats({
      total: newResults.length,
      valid: validCount,
      invalid: newResults.length - validCount,
    })
  }

  const commonTestWords = [
    "tin",
    "gold",
    "iron",
    "zinc",
    "lead",
    "coal",
    "clay",
    "sand",
    "rock",
    "wood",
    "wool",
    "silk",
    "hemp",
    "jute",
    "flax",
    "cork",
    "wax",
    "jade",
    "ruby",
    "opal",
  ]

  const loadCommonWords = () => {
    setWordList(commonTestWords.join(", "))
  }

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-md">
      <h3 className="text-lg font-medium mb-2">Dictionary Word Tester</h3>

      <div className="mb-4">
        <textarea
          value={wordList}
          onChange={(e) => setWordList(e.target.value)}
          className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded"
          placeholder="Enter words separated by spaces, commas, or line breaks"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={testWords} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
          Test Words
        </button>
        <button onClick={loadCommonWords} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">
          Load Test Words
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <div className="mb-2 flex gap-4">
            <span>Total: {stats.total}</span>
            <span className="text-green-400">Valid: {stats.valid}</span>
            <span className="text-red-400">Invalid: {stats.invalid}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  result.valid ? "bg-green-900/30 border border-green-800" : "bg-red-900/30 border border-red-800"
                }`}
              >
                {result.word} - {result.valid ? "✓" : "✗"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
