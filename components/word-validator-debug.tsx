"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateWord } from "@/lib/utils/wordValidator"
import { couldBeValidWord } from "@/lib/services/dictionaryService"

export default function WordValidatorDebug() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [recentChecks, setRecentChecks] = useState<{ word: string; valid: boolean }[]>([])

  const checkWord = () => {
    if (!word) return

    const isValid = validateWord(word)
    const couldBeValid = couldBeValidWord(word)

    setResult(
      `"${word}": 
      - Is valid word: ${isValid ? "Yes ✓" : "No ✗"}
      - Could be valid prefix: ${couldBeValid ? "Yes ✓" : "No ✗"}`,
    )

    // Add to recent checks
    setRecentChecks((prev) => {
      const newChecks = [{ word, valid: isValid }, ...prev.slice(0, 9)]
      return newChecks
    })
  }

  // Common test words to check
  const testWords = ["ate", "tea", "tag", "urn", "boat", "cat", "dog", "run", "sun", "fun"]

  const checkTestWord = (testWord: string) => {
    setWord(testWord)
    setTimeout(() => {
      const isValid = validateWord(testWord)
      const couldBeValid = couldBeValidWord(testWord)

      setResult(
        `"${testWord}": 
        - Is valid word: ${isValid ? "Yes ✓" : "No ✗"}
        - Could be valid prefix: ${couldBeValid ? "Yes ✓" : "No ✗"}`,
      )

      // Add to recent checks
      setRecentChecks((prev) => {
        const newChecks = [{ word: testWord, valid: isValid }, ...prev.slice(0, 9)]
        return newChecks
      })
    }, 100)
  }

  return (
    <Card className="border-none bg-gradient-to-r from-cyan-800 to-blue-900 shadow-lg mt-4">
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-base text-white">Word Validator Debug</CardTitle>
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

        <div className="mt-4">
          <h3 className="text-sm font-medium text-white mb-2">Quick Test Words</h3>
          <div className="flex flex-wrap gap-2">
            {testWords.map((testWord) => (
              <Button
                key={testWord}
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/10"
                onClick={() => checkTestWord(testWord)}
              >
                {testWord}
              </Button>
            ))}
          </div>
        </div>

        {recentChecks.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-white mb-2">Recent Checks</h3>
            <div className="bg-white/10 rounded p-2 max-h-32 overflow-y-auto">
              {recentChecks.map((check, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1 border-b border-white/10 last:border-0"
                >
                  <span className="text-white">{check.word}</span>
                  <span className={check.valid ? "text-green-400" : "text-red-400"}>
                    {check.valid ? "Valid ✓" : "Invalid ✗"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
