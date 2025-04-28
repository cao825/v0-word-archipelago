"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateWord } from "@/lib/utils/wordValidator"
import { couldBeValidWord, getWordDifficulty, dictionary } from "@/lib/services/dictionaryService"

// Import the dictionary tester
import DictionaryTester from "./dictionary-tester"

export default function DictionaryDebug() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [showDictionary, setShowDictionary] = useState(false)
  const [showSpecialRules, setShowSpecialRules] = useState(false)

  const checkWord = () => {
    if (!word) return

    const isValid = validateWord(word)
    const couldBeValid = couldBeValidWord(word)
    const difficulty = getWordDifficulty(word)

    setResult(
      `"${word}": 
      - Is valid word: ${isValid ? "Yes" : "No"}
      - Could be valid prefix: ${couldBeValid ? "Yes" : "No"}
      - Difficulty rating: ${difficulty}/10
      - Contains Q without U: ${word.toLowerCase().includes("q") && !word.toLowerCase().includes("qu") ? "Yes" : "No"}`,
    )
  }

  return (
    <Card className="border-none bg-gradient-to-r from-cyan-800 to-blue-900 shadow-lg mt-4">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-base text-white">Dictionary Debug</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word to check"
            className="bg-white/10 border-white/20 text-white"
          />
          <Button onClick={checkWord} className="bg-cyan-500 hover:bg-cyan-600">
            Check
          </Button>
        </div>
        {result && <div className="mt-2 p-2 rounded bg-white/10 text-white whitespace-pre-line">{result}</div>}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => setShowDictionary(!showDictionary)}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            {showDictionary ? "Hide Dictionary Stats" : "Show Dictionary Stats"}
          </Button>

          <Button
            onClick={() => setShowSpecialRules(!showSpecialRules)}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            {showSpecialRules ? "Hide Special Rules" : "Show Special Rules"}
          </Button>
        </div>

        {showDictionary && (
          <div className="mt-2 p-2 rounded bg-white/10 text-white">
            <p>Dictionary size: {dictionary.length} words</p>
            <p>Words starting with 'b': {dictionary.filter((w) => w.startsWith("b")).length}</p>
            <p>Words starting with 't': {dictionary.filter((w) => w.startsWith("t")).length}</p>
            <p>Words with 'q': {dictionary.filter((w) => w.includes("q")).length}</p>
            <p>Words with 'qu': {dictionary.filter((w) => w.includes("qu")).length}</p>
            <p>3-letter words: {dictionary.filter((w) => w.length === 3).length}</p>
            <p>4-letter words: {dictionary.filter((w) => w.length === 4).length}</p>
            <p>Contains 'boat': {dictionary.includes("boat") ? "Yes" : "No"}</p>
            <p>Contains 'tag': {dictionary.includes("tag") ? "Yes" : "No"}</p>
          </div>
        )}

        {showSpecialRules && (
          <div className="mt-2 p-2 rounded bg-white/10 text-white">
            <h3 className="font-bold mb-2">Special Dictionary Rules:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Words must be at least 2 letters long</li>
              <li>The letter Q must always be followed by U</li>
              <li>Words are validated against an English dictionary</li>
              <li>Real-time validation provides feedback as you type</li>
            </ul>
          </div>
        )}
        <DictionaryTester />
      </CardContent>
    </Card>
  )
}
