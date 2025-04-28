"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getHourlyLeaderboard,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  formatTimestamp,
  type LeaderboardEntry,
  addLeaderboardEntry,
  formatInitials,
} from "@/lib/utils/leaderboardUtils"
import { getCurrentHourTimestamp } from "@/lib/slices/gameSlice"

export default function LeaderboardDisplay() {
  const [hourlyLeaderboard, setHourlyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([])
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [currentHour, setCurrentHour] = useState<string>(getCurrentHourTimestamp())

  // Function to refresh leaderboard data
  const refreshLeaderboards = useCallback(() => {
    setHourlyLeaderboard(getHourlyLeaderboard())
    setDailyLeaderboard(getDailyLeaderboard())
    setAllTimeLeaderboard(getAllTimeLeaderboard())
    setLastRefreshed(new Date())
    setCurrentHour(getCurrentHourTimestamp())
  }, [])

  // Add a function to handle submitting a new score
  const submitScore = useCallback(
    (playerInitials: string, score: number, wordsFound: number, objectivesCompleted: number) => {
      const entry: LeaderboardEntry = {
        playerInitials: formatInitials(playerInitials),
        score,
        timestamp: Date.now(),
        objectivesCompleted,
        wordsFound,
      }

      const added = addLeaderboardEntry(entry)
      if (added) {
        refreshLeaderboards()
        return true
      }
      return false
    },
    [refreshLeaderboards],
  )

  // Export the submitScore function so it can be used by other components
  ;(window as any).submitLeaderboardScore = submitScore

  useEffect(() => {
    // Load leaderboards initially
    refreshLeaderboards()

    // Refresh leaderboards every 60 seconds
    const refreshInterval = setInterval(refreshLeaderboards, 60000)

    return () => clearInterval(refreshInterval)
  }, [refreshLeaderboards])

  // Memoize the formatted hour display to avoid recalculating on every render
  const formattedHourDisplay = useMemo(() => {
    const parts = currentHour.split("-")
    if (parts.length >= 4) {
      const hour = Number.parseInt(parts[3])
      return `${hour}:00 - ${(hour + 1) % 24}:00`
    }
    return "Current Hour"
  }, [currentHour])

  // Memoize the renderLeaderboard function to avoid recreating it on every render
  const renderLeaderboard = useCallback((entries: LeaderboardEntry[]) => {
    if (entries.length === 0) {
      return <p className="text-center text-sky-400 py-4 text-sm">No entries yet</p>
    }

    return (
      <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
        {entries.map((entry, index) => (
          <div key={index} className="bg-sky-900 rounded-md p-1.5 flex items-center border border-sky-700">
            <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center font-bold mr-2 text-xs">
              {index + 1}
            </div>
            <div className="flex-1 flex items-center">
              <div className="bg-sky-950 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider text-amber-300 mr-2 uppercase text-xs">
                {entry.playerInitials}
              </div>
              <div className="text-[10px] text-sky-300">
                {entry.wordsFound} words · {entry.objectivesCompleted} obj
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-base text-amber-400">{entry.score}</div>
              <div className="text-[10px] text-sky-300">{formatTimestamp(entry.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }, [])

  return (
    <Tabs defaultValue="hourly" className="w-full">
      <TabsList className="grid grid-cols-3 bg-sky-900">
        <TabsTrigger value="hourly" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
          Hourly
        </TabsTrigger>
        <TabsTrigger value="daily" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
          Daily
        </TabsTrigger>
        <TabsTrigger value="alltime" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
          All Time
        </TabsTrigger>
      </TabsList>
      <TabsContent value="hourly" className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-light tracking-wide text-sky-100">{formattedHourDisplay}</h3>
          <button
            onClick={refreshLeaderboards}
            className="text-xs text-sky-300 hover:text-sky-100 flex items-center gap-1"
          >
            <span>Refresh</span>
            <span className="text-[10px]">({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
        {renderLeaderboard(hourlyLeaderboard)}
      </TabsContent>
      <TabsContent value="daily" className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-light tracking-wide text-sky-100">DAILY TOP SCORES</h3>
          <button
            onClick={refreshLeaderboards}
            className="text-xs text-sky-300 hover:text-sky-100 flex items-center gap-1"
          >
            <span>Refresh</span>
            <span className="text-[10px]">({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
        {renderLeaderboard(dailyLeaderboard)}
      </TabsContent>
      <TabsContent value="alltime" className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-light tracking-wide text-sky-100">ALL-TIME TOP SCORES</h3>
          <button
            onClick={refreshLeaderboards}
            className="text-xs text-sky-300 hover:text-sky-100 flex items-center gap-1"
          >
            <span>Refresh</span>
            <span className="text-[10px]">({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
        {renderLeaderboard(allTimeLeaderboard)}
      </TabsContent>
    </Tabs>
  )
}
