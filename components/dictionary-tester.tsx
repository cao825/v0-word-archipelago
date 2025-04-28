"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateWord } from "@/lib/utils/wordValidator"
import { isWordInDictionary, getDictionarySize, getWordsWithPrefix } from "@/lib/utils/dictionary-checker"

export default function DictionaryTester() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [dictionarySize, setDictionarySize] = useState(0)
  const [similarWords, setSimilarWords] = useState<string[]>([])
  const [recentChecks, setRecentChecks] = useState<{ word: string; valid: boolean }[]>([])

  // Get dictionary size on component mount
  useEffect(() => {
    setDictionarySize(getDictionarySize())
  }, [])

  const checkWord = () => {
    if (!word) return

    const isValid = validateWord(word)
    const isInDictionary = isWordInDictionary(word)

    // Find similar words (words that start with the same first 2 letters)
    const prefix = word.length >= 2 ? word.substring(0, 2) : word
    const similar = getWordsWithPrefix(prefix).slice(0, 10) // Limit to 10 words

    setResult(
      `"${word}": 
      - Is valid word: ${isValid ? "Yes ✓" : "No ✗"}
      - In dictionary: ${isInDictionary ? "Yes ✓" : "No ✗"}`,
    )

    setSimilarWords(similar)

    // Add to recent checks
    setRecentChecks((prev) => {
      const newChecks = [{ word, valid: isValid }, ...prev.slice(0, 9)]
      return newChecks
    })
  }

  // Common test words to check
  const testWords = ["plot", "plug", "plan", "play", "tent", "text", "tool", "fork", "lamp", "desk"]

  const checkTestWord = (testWord: string) => {
    setWord(testWord)
    setTimeout(() => {
      const isValid = validateWord(testWord)
      const isInDictionary = isWordInDictionary(testWord)

      setResult(
        `"${testWord}": 
        - Is valid word: ${isValid ? "Yes ✓" : "No ✗"}
        - In dictionary: ${isInDictionary ? "Yes ✓" : "No ✗"}`,
      )

      // Find similar words
      const prefix = testWord.length >= 2 ? testWord.substring(0, 2) : testWord
      const similar = getWordsWithPrefix(prefix).slice(0, 10)
      setSimilarWords(similar)

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
        <CardTitle className="text-base text-white">Dictionary Tester</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-sky-300 mb-2">Dictionary contains {dictionarySize.toLocaleString()} words</div>

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

        {similarWords.length > 0 && (
          <div className="mt-2">
            <h3 className="text-xs font-medium text-white mb-1">Similar Words:</h3>
            <div className="flex flex-wrap gap-1">
              {similarWords.map((word) => (
                <span key={word} className="text-xs bg-sky-700/50 text-sky-200 px-1.5 py-0.5 rounded">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

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
