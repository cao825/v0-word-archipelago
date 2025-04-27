"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateWord } from "@/lib/utils/wordValidator"
import { dictionary } from "@/lib/utils/dictionary"

export default function DebugPanel() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [showDictionary, setShowDictionary] = useState(false)

  const checkWord = () => {
    if (!word) return

    const isValid = validateWord(word)
    setResult(isValid ? `"${word}" is a valid word!` : `"${word}" is not in the dictionary.`)
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
        {result && <div className="mt-2 p-2 rounded bg-white/10 text-white">{result}</div>}

        <div className="mt-4">
          <Button
            onClick={() => setShowDictionary(!showDictionary)}
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            {showDictionary ? "Hide Dictionary Stats" : "Show Dictionary Stats"}
          </Button>

          {showDictionary && (
            <div className="mt-2 p-2 rounded bg-white/10 text-white">
              <p>Dictionary size: {dictionary.length} words</p>
              <p>Words starting with 'b': {dictionary.filter((w) => w.startsWith("b")).length}</p>
              <p>Words starting with 't': {dictionary.filter((w) => w.startsWith("t")).length}</p>
              <p>3-letter words: {dictionary.filter((w) => w.length === 3).length}</p>
              <p>4-letter words: {dictionary.filter((w) => w.length === 4).length}</p>
              <p>Contains 'boat': {dictionary.includes("boat") ? "Yes" : "No"}</p>
              <p>Contains 'tag': {dictionary.includes("tag") ? "Yes" : "No"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
