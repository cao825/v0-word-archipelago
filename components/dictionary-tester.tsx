"use client"

import { useState } from "react"
import { validateWord } from "../lib/services/dictionaryService"
import { isWordInDictionary, getDictionarySize } from "../lib/utils/dictionary-checker"

export default function DictionaryTester() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [dictionarySize, setDictionarySize] = useState(getDictionarySize())

  const checkWord = () => {
    if (!word.trim()) {
      setResult("Please enter a word")
      return
    }

    const isValid = validateWord(word.trim())
    const inDictionary = isWordInDictionary(word.trim())

    setResult(
      `"${word}" is ${isValid ? "valid" : "invalid"} for gameplay.
       In dictionary: ${inDictionary ? "Yes" : "No"}`,
    )

    // Refresh dictionary size in case words were added
    setDictionarySize(getDictionarySize())
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Dictionary Tester</h3>
      <p className="text-sm text-gray-600 mb-2">Dictionary size: {dictionarySize} words</p>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="px-3 py-1 border rounded"
          placeholder="Enter a word"
        />
        <button onClick={checkWord} className="px-3 py-1 bg-blue-500 text-white rounded">
          Check
        </button>
      </div>

      {result && (
        <div className="mt-2 p-2 bg-white rounded">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
