"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Award, RotateCcw, Share2 } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"
import { addLeaderboardEntry, formatInitials, type LeaderboardEntry } from "@/lib/utils/leaderboardUtils"
import { toast } from "@/components/ui/use-toast"

interface GameOverModalProps {
  score: number
  foundWords: string[]
  objectives: Objective[]
  onResetGame: () => void
  onShare: () => void
}

export default function GameOverModal({ score, foundWords, objectives, onResetGame, onShare }: GameOverModalProps) {
  const [playerInitials, setPlayerInitials] = useState("")
  const [formattedInitials, setFormattedInitials] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: string
    seconds: string
  }>({
    minutes: "00",
    seconds: "00",
  })

  const [isVisible, setIsVisible] = useState(false)

  // Animation delay for modal appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Count completed objectives
  const completedObjectives = objectives.filter((obj) => obj.completed).length

  const completedObjectivesList = objectives.filter((obj) => obj.completed)
  const objectiveBonus = completedObjectivesList.length * 50 // 50 points per objective
  const wordPoints = score - objectiveBonus

  // Calculate time until next puzzle
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0)

      const diffMs = nextHour.getTime() - now.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffSeconds = Math.floor((diffMs % 60000) / 1000)

      setTimeRemaining({
        minutes: String(diffMinutes).padStart(2, "0"),
        seconds: String(diffSeconds).padStart(2, "0"),
      })

      // Check if we've reached the next hour (countdown reached zero)
      if (diffMinutes === 0 && diffSeconds === 0) {
        // Refresh the page to get the new puzzle
        window.location.reload()
      }
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update formatted initials whenever input changes
  useEffect(() => {
    setFormattedInitials(formatInitials(playerInitials))
  }, [playerInitials])

  // Handle input change - convert to uppercase as user types
  const handleInitialsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase immediately
    const input = e.target.value.toUpperCase()

    // Only allow letters
    const lettersOnly = input.replace(/[^A-Z]/g, "")

    // Limit to 3 characters
    const limited = lettersOnly.substring(0, 3)

    setPlayerInitials(limited)
  }, [])

  const handleSubmitScore = useCallback(() => {
    if (!playerInitials.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const entry: LeaderboardEntry = {
        playerInitials: formattedInitials,
        score,
        timestamp: Date.now(),
        objectivesCompleted: completedObjectivesList.length,
        wordsFound: foundWords.length,
      }

      const success = addLeaderboardEntry(entry)

      if (success) {
        setSubmitted(true)
        setActiveTab("leaderboard")
      } else {
        toast({
          title: "Submission Error",
          description: "Please wait a moment before submitting again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting score:", error)
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your score. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [playerInitials, isSubmitting, formattedInitials, score, completedObjectivesList.length, foundWords.length])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 p-4">
      <div
        className={`bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-500 ease-out ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="p-6 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Game Over</h2>
            <p className="text-slate-300">Your archipelago adventure has ended!</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Award className="w-12 h-12 text-amber-400" />
            </div>
          </div>

          <div className="mb-6">
            <div className="text-4xl font-bold text-amber-400 mb-1">{score}</div>
            <p className="text-slate-300">Final Score</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{foundWords.length}</div>
              <div className="text-slate-400 text-sm">Words Found</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {completedObjectives}/{objectives.length}
              </div>
              <div className="text-slate-400 text-sm">Objectives</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onShare}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 size={18} />
              Share Results
            </button>
            <button
              onClick={onResetGame}
              className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw size={18} />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
