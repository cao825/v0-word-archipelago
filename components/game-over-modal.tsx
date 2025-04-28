"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock } from "lucide-react"
import type { Objective } from "@/lib/slices/gameSlice"
import { addLeaderboardEntry, formatInitials, type LeaderboardEntry } from "@/lib/utils/leaderboardUtils"
import LeaderboardDisplay from "./leaderboard-display"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

interface GameOverModalProps {
  score: number
  foundWords: string[]
  objectives: Objective[]
  onResetGame: () => void
}

export default function GameOverModal({ score, foundWords, objectives, onResetGame }: GameOverModalProps) {
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

  const completedObjectives = objectives.filter((obj) => obj.completed)
  const objectiveBonus = completedObjectives.length * 50 // 50 points per objective
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
        objectivesCompleted: completedObjectives.length,
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
  }, [playerInitials, isSubmitting, formattedInitials, score, completedObjectives.length, foundWords.length])

  return (
    <div className="fixed inset-0 bg-sky-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-sky-700 bg-gradient-to-b from-sky-800 to-sky-900 text-white shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              GAME <span className="font-bold text-amber-400">OVER</span>
            </CardTitle>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-sky-900 mx-4">
              <TabsTrigger value="summary" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-0">
              <CardContent className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-light tracking-wide text-sky-100 mb-1">FINAL SCORE</h3>
                  <p className="text-4xl font-bold text-amber-400">{score}</p>
                  <div className="mt-2 text-sm bg-sky-900 rounded-md p-2 flex justify-between">
                    <span>Words: {wordPoints} pts</span>
                    <span className="text-amber-400">Objectives: +{objectiveBonus} pts</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light tracking-wide text-sky-100 mb-2">OBJECTIVES COMPLETED</h3>
                  <div className="bg-sky-900 rounded-md p-3 border border-sky-700">
                    {completedObjectives.length === 0 ? (
                      <p className="text-sky-400 text-center">No objectives completed</p>
                    ) : (
                      <ul className="space-y-1">
                        {completedObjectives.map((obj) => (
                          <li key={obj.id} className="text-white flex items-start gap-2">
                            <span className="text-amber-400">✓</span> {obj.description}
                            <span className="ml-auto text-amber-400">+50 pts</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-light tracking-wide text-sky-100 mb-2">
                    WORDS FOUND ({foundWords.length})
                  </h3>
                  <div className="bg-sky-900 rounded-md p-3 max-h-40 overflow-y-auto border border-sky-700">
                    {foundWords.length === 0 ? (
                      <p className="text-sky-400 text-center">No words found</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {foundWords.map((word, index) => (
                          <span
                            key={index}
                            className="bg-sky-950 text-amber-300 px-2 py-1 rounded-md text-xs border border-sky-800"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-sky-900 rounded-md p-3 border border-sky-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" />
                      <h3 className="text-sm font-medium text-amber-200">NEXT PUZZLE IN</h3>
                    </div>
                    <div className="text-lg font-mono font-bold text-amber-100">
                      {timeRemaining.minutes}:{timeRemaining.seconds}
                    </div>
                  </div>
                  <p className="text-xs text-sky-300 mt-1">
                    New puzzles are available every hour. Come back to improve your score!
                  </p>
                </div>

                {!submitted && (
                  <div>
                    <h3 className="text-lg font-light tracking-wide text-sky-100 mb-2">ENTER YOUR INITIALS</h3>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="AAA"
                          value={playerInitials}
                          onChange={handleInitialsChange}
                          maxLength={3}
                          className="bg-sky-900 border-sky-700 text-white text-center text-xl font-bold tracking-widest uppercase"
                          aria-label="Enter your initials (3 letters)"
                        />
                        <p className="text-xs text-sky-300 mt-1 text-center">Enter 3 letters</p>
                      </div>
                      <Button
                        onClick={handleSubmitScore}
                        className="bg-amber-500 hover:bg-amber-600 whitespace-nowrap"
                        disabled={!playerInitials.trim() || isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                    </div>
                    <p className="text-xs text-sky-300 mt-2 text-center">
                      Leaderboard data is stored locally in your browser and simulates a global leaderboard experience.
                    </p>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-0">
              <CardContent>
                <LeaderboardDisplay />
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="pt-2">
            <Button onClick={onResetGame} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg">
              Play Again
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
