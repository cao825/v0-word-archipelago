"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Trophy, Check } from "lucide-react"
import LeaderboardDisplay from "./leaderboard-display"
import { addLeaderboardEntry } from "@/lib/utils/leaderboardUtils"

interface ScoreSubmissionProps {
  score: number
  wordsFound: number
  objectivesCompleted: number
  totalObjectives: number
  onSubmit: () => void
  onSkip: () => void
  playerInitials?: string // Optional prop to pre-fill initials
}

export default function ScoreSubmission({
  score,
  wordsFound,
  objectivesCompleted,
  totalObjectives,
  onSubmit,
  onSkip,
  playerInitials = "",
}: ScoreSubmissionProps) {
  const [initials, setInitials] = useState(playerInitials)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [submittedInitials, setSubmittedInitials] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current && !playerInitials) {
      inputRef.current.focus()
    }
  }, [playerInitials])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!initials.trim()) {
      setError("Please enter your initials")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Submit directly to leaderboard using the utility function
      const formattedInitials = initials.toUpperCase().trim().substring(0, 3)

      // Create the leaderboard entry
      const success = addLeaderboardEntry({
        playerInitials: formattedInitials,
        score,
        wordsFound,
        objectivesCompleted,
        timestamp: Date.now(),
      })

      if (!success) {
        throw new Error("Failed to submit score")
      }

      // Also submit using the global function for backward compatibility
      if (typeof window !== "undefined" && window.submitLeaderboardScore) {
        window.submitLeaderboardScore(formattedInitials, score, wordsFound, objectivesCompleted)
      }

      // Store the submitted initials to highlight in leaderboard
      setSubmittedInitials(formattedInitials)

      // Show success message
      setShowSuccess(true)

      // Short delay before showing leaderboard
      setTimeout(() => {
        setShowLeaderboard(true)

        // Force refresh the leaderboard
        if (window.refreshLeaderboardDisplay) {
          window.refreshLeaderboardDisplay()
        }
      }, 1200)
    } catch (error) {
      console.error("Error submitting score:", error)
      setError("Failed to submit score. Please try again.")
      setIsSubmitting(false)
    }
  }

  // If showing leaderboard, render it
  if (showLeaderboard) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white text-center mb-4">Leaderboard</h2>
        <LeaderboardDisplay highlightInitials={submittedInitials} />
        <button
          onClick={onSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Score Submitted!</h2>
          <p className="text-slate-300">Your score has been added to the leaderboard</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">New High Score!</h2>
          <p className="text-slate-300 mb-4">
            Your score of <span className="text-amber-400 font-bold">{score}</span> qualifies for the leaderboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="initials" className="block text-sm font-medium text-slate-300 mb-1">
                Enter your initials (3 letters)
              </label>
              <input
                type="text"
                id="initials"
                ref={inputRef}
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-center text-xl font-bold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase"
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Score"}
              </button>

              <button
                type="button"
                onClick={onSkip}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg font-medium transition-colors"
              >
                Skip
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
