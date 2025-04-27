"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getHourlyLeaderboard,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  formatTimestamp,
  type LeaderboardEntry,
} from "@/lib/utils/leaderboardUtils"

export default function LeaderboardDisplay() {
  const [hourlyLeaderboard, setHourlyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Load leaderboards
    setHourlyLeaderboard(getHourlyLeaderboard())
    setDailyLeaderboard(getDailyLeaderboard())
    setAllTimeLeaderboard(getAllTimeLeaderboard())
  }, [])

  const renderLeaderboard = (entries: LeaderboardEntry[]) => {
    if (entries.length === 0) {
      return <p className="text-center text-sky-400 py-4">No entries yet</p>
    }

    return (
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {entries.map((entry, index) => (
          <div key={index} className="bg-sky-900 rounded-md p-2 flex items-center border border-sky-700">
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold mr-2">
              {index + 1}
            </div>
            <div className="flex-1 flex items-center">
              <div className="bg-sky-950 px-3 py-1 rounded-md font-mono font-bold tracking-wider text-amber-300 mr-3 uppercase">
                {entry.playerInitials}
              </div>
              <div className="text-xs text-sky-300">
                {entry.wordsFound} words · {entry.objectivesCompleted} objectives
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-amber-400">{entry.score}</div>
              <div className="text-xs text-sky-300">{formatTimestamp(entry.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

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
        <h3 className="text-lg font-light tracking-wide text-sky-100 mb-2">HOURLY TOP SCORES</h3>
        {renderLeaderboard(hourlyLeaderboard)}
      </TabsContent>
      <TabsContent value="daily" className="mt-2">
        <h3 className="text-lg font-light tracking-wide text-sky-100 mb-2">DAILY TOP SCORES</h3>
        {renderLeaderboard(dailyLeaderboard)}
      </TabsContent>
      <TabsContent value="alltime" className="mt-2">
        <h3 className="text-lg font-light tracking-wide text-sky-100 mb-2">ALL-TIME TOP SCORES</h3>
        {renderLeaderboard(allTimeLeaderboard)}
      </TabsContent>
    </Tabs>
  )
}
