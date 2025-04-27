"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateWord } from "@/lib/utils/wordValidator"

export default function DebugPanel() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState<string | null>(null)

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
      </CardContent>
    </Card>
  )
}
