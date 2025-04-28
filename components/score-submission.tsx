"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ScoreSubmissionProps {
  score: number
  wordsFound: number
  objectivesCompleted: number
  totalObjectives: number
  onSubmit: () => void
  onSkip: () => void
}

export default function ScoreSubmission({
  score,
  wordsFound,
  objectivesCompleted,
  totalObjectives,
  onSubmit,
  onSkip,
}: ScoreSubmissionProps) {
  const [initials, setInitials] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!initials.trim()) {
      setError("Please enter your initials")
      return
    }

    setIsSubmitting(true)

    // Use the globally exposed function to submit the score
    if (window.submitLeaderboardScore) {
      window.submitLeaderboardScore(initials, score, wordsFound, objectivesCompleted)
      setIsSubmitting(false)
      onSubmit()
    } else {
      console.error("submitLeaderboardScore function not found")
      setIsSubmitting(false)
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-sky-800/50 p-4 rounded-lg">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white">Submit Your Score</h3>
          <p className="text-sky-200 text-sm">Your score qualifies for the leaderboard!</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-sky-700/50 p-2 rounded-lg text-center">
            <div className="text-xl font-bold text-amber-400">{score}</div>
            <div className="text-sky-300 text-xs">Score</div>
          </div>
          <div className="bg-sky-700/50 p-2 rounded-lg text-center">
            <div className="text-xl font-bold text-white">
              {objectivesCompleted}/{totalObjectives}
            </div>
            <div className="text-sky-300 text-xs">Objectives</div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="initials" className="block text-sm font-medium text-sky-200 mb-1">
            Enter your initials (3 letters):
          </label>
          <Input
            id="initials"
            value={initials}
            onChange={(e) => {
              setInitials(e.target.value.slice(0, 3).toUpperCase())
              setError("")
            }}
            maxLength={3}
            className="bg-sky-900/50 border-sky-600 text-white uppercase"
            placeholder="AAA"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Score"}
          </Button>
          <Button onClick={onSkip} variant="outline" className="border-sky-600 text-sky-200 hover:bg-sky-700/50">
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}
