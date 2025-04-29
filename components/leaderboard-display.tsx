"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getHourlyLeaderboard,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  fetchHourlyLeaderboard,
  fetchDailyLeaderboard,
  fetchAllTimeLeaderboard,
  formatTimestamp,
  type LeaderboardEntry,
  addLeaderboardEntry,
  formatInitials,
} from "@/lib/utils/leaderboardUtils"
import { getCurrentHourTimestamp } from "@/lib/slices/gameSlice"
import { Loader2 } from "lucide-react"

interface LeaderboardDisplayProps {
  highlightInitials?: string
}

export default function LeaderboardDisplay({ highlightInitials }: LeaderboardDisplayProps) {
  const [hourlyLeaderboard, setHourlyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([])
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [currentHour, setCurrentHour] = useState<string>(getCurrentHourTimestamp())
  const [activeTab, setActiveTab] = useState<string>("hourly")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hourlyLoading, setHourlyLoading] = useState<boolean>(true)
  const [dailyLoading, setDailyLoading] = useState<boolean>(true)
  const [allTimeLoading, setAllTimeLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const maxRetries = 3

  // Add refs for each leaderboard container
  const hourlyContainerRef = useRef<HTMLDivElement>(null)
  const dailyContainerRef = useRef<HTMLDivElement>(null)
  const allTimeContainerRef = useRef<HTMLDivElement>(null)

  // Function to refresh leaderboard data with retry logic
  const refreshLeaderboards = useCallback(async () => {
    console.log("Refreshing leaderboards...")
    setIsLoading(true)
    setHourlyLoading(true)
    setDailyLoading(true)
    setAllTimeLoading(true)
    setFetchError(null)

    try {
      // Get initial data from local storage for immediate display
      const localHourly = getHourlyLeaderboard()
      const localDaily = getDailyLeaderboard()
      const localAllTime = getAllTimeLeaderboard()

      setHourlyLeaderboard(localHourly)
      setDailyLeaderboard(localDaily)
      setAllTimeLeaderboard(localAllTime)

      // Then fetch fresh data from Supabase
      try {
        const hourly = await fetchHourlyLeaderboard()
        if (hourly.length > 0) {
          setHourlyLeaderboard(hourly)
        }
        setHourlyLoading(false)
      } catch (error) {
        console.error("Error fetching hourly leaderboard:", error)
        setHourlyLoading(false)
      }

      try {
        const daily = await fetchDailyLeaderboard()
        if (daily.length > 0) {
          setDailyLeaderboard(daily)
        }
        setDailyLoading(false)
      } catch (error) {
        console.error("Error fetching daily leaderboard:", error)
        setDailyLoading(false)
      }

      try {
        const allTime = await fetchAllTimeLeaderboard()
        if (allTime.length > 0) {
          setAllTimeLeaderboard(allTime)
        }
        setAllTimeLoading(false)
      } catch (error) {
        console.error("Error fetching all-time leaderboard:", error)
        setAllTimeLoading(false)
      }

      setLastRefreshed(new Date())
      setCurrentHour(getCurrentHourTimestamp())
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error refreshing leaderboards:", error)

      // Implement retry with exponential backoff
      if (retryCount < maxRetries) {
        const backoffTime = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`Retrying in ${backoffTime}ms (attempt ${retryCount + 1}/${maxRetries})`)

        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          refreshLeaderboards()
        }, backoffTime)
      } else {
        setFetchError("Failed to load leaderboard data after multiple attempts. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [retryCount])

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

  // Export the refresh function so it can be called from elsewhere
  ;(window as any).refreshLeaderboardDisplay = refreshLeaderboards

  // Reset scroll position when changing tabs
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)

    // Reset scroll position to top when changing tabs
    setTimeout(() => {
      if (value === "hourly" && hourlyContainerRef.current) {
        hourlyContainerRef.current.scrollTop = 0
      } else if (value === "daily" && dailyContainerRef.current) {
        dailyContainerRef.current.scrollTop = 0
      } else if (value === "alltime" && allTimeContainerRef.current) {
        allTimeContainerRef.current.scrollTop = 0
      }
    }, 50) // Small delay to ensure the tab content is rendered
  }, [])

  useEffect(() => {
    // Load leaderboards initially
    refreshLeaderboards()

    // Refresh leaderboards every 60 seconds
    const refreshInterval = setInterval(refreshLeaderboards, 60000)

    return () => clearInterval(refreshInterval)
  }, [refreshLeaderboards])

  // Track if we've already set the initial tab
  const initialTabSetRef = useRef(false)

  // If highlightInitials is provided, find which tab contains the entry and set it as active
  // But only do this once when the component mounts or when highlightInitials changes
  useEffect(() => {
    // Skip if we've already set the tab for this highlightInitials value
    // or if there are no highlightInitials
    if (!highlightInitials || initialTabSetRef.current) {
      return
    }

    // Find the most recent entry with matching initials in each tab
    const findMostRecentEntry = (entries: LeaderboardEntry[]) => {
      return (
        entries
          .filter((entry) => entry.playerInitials === highlightInitials)
          .sort((a, b) => b.timestamp - a.timestamp)[0] || null
      )
    }

    const hourlyEntry = findMostRecentEntry(hourlyLeaderboard)
    const dailyEntry = findMostRecentEntry(dailyLeaderboard)
    const allTimeEntry = findMostRecentEntry(allTimeLeaderboard)

    // Find the most recent entry across all tabs
    const allEntries = [hourlyEntry, dailyEntry, allTimeEntry].filter(Boolean) as LeaderboardEntry[]
    const mostRecentEntry = allEntries.sort((a, b) => b.timestamp - a.timestamp)[0] || null

    if (mostRecentEntry) {
      // Set the tab based on which leaderboard contains the most recent entry
      if (hourlyEntry && hourlyEntry.timestamp === mostRecentEntry.timestamp) {
        setActiveTab("hourly")
      } else if (dailyEntry && dailyEntry.timestamp === mostRecentEntry.timestamp) {
        setActiveTab("daily")
      } else if (allTimeEntry && allTimeEntry.timestamp === mostRecentEntry.timestamp) {
        setActiveTab("alltime")
      }
      initialTabSetRef.current = true
    } else {
      // If the entry is not found in any tab, force a refresh
      console.log("Entry not found in any tab, forcing refresh...")
      refreshLeaderboards()
    }
  }, [highlightInitials, hourlyLeaderboard, dailyLeaderboard, allTimeLeaderboard, refreshLeaderboards])

  // Reset the initialTabSetRef when highlightInitials changes
  useEffect(() => {
    initialTabSetRef.current = false
  }, [highlightInitials])

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
  const renderLeaderboard = useCallback(
    (entries: LeaderboardEntry[], isLoadingState: boolean, containerRef: React.RefObject<HTMLDivElement>) => {
      if (fetchError) {
        return (
          <div className="flex items-center justify-center py-8 text-red-400">
            <p>{fetchError}</p>
          </div>
        )
      }

      if (isLoadingState && entries.length === 0) {
        return (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            <span className="ml-2 text-sky-400">Loading leaderboard...</span>
          </div>
        )
      }

      if (entries.length === 0) {
        return <p className="text-center text-sky-400 py-4 text-sm">No entries yet</p>
      }

      // Find the most recent entry with matching initials
      let mostRecentMatchingEntry: LeaderboardEntry | null = null
      if (highlightInitials) {
        mostRecentMatchingEntry =
          entries
            .filter((entry) => entry.playerInitials === highlightInitials)
            .sort((a, b) => b.timestamp - a.timestamp)[0] || null
      }

      return (
        <div ref={containerRef} className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 leaderboard-container">
          {entries.map((entry, index) => {
            // Check if this entry should be highlighted (only highlight the most recent matching entry)
            const isHighlighted =
              highlightInitials &&
              mostRecentMatchingEntry &&
              entry.playerInitials === highlightInitials &&
              entry.timestamp === mostRecentMatchingEntry.timestamp

            return (
              <div
                key={`${entry.playerInitials}-${entry.timestamp}-${index}`}
                className={`bg-sky-900 rounded-md p-1.5 flex items-center border ${
                  isHighlighted ? "border-amber-400 shadow-lg shadow-amber-400/20 animate-pulse" : "border-sky-700"
                }`}
                ref={
                  isHighlighted
                    ? (el) => {
                        // Scroll to the highlighted element
                        if (el) {
                          setTimeout(() => {
                            el.scrollIntoView({ behavior: "smooth", block: "center" })
                          }, 100)
                        }
                      }
                    : undefined
                }
              >
                <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center font-bold mr-2 text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 flex items-center">
                  <div
                    className={`bg-sky-950 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider mr-2 uppercase text-xs ${
                      isHighlighted ? "text-amber-300 ring-2 ring-amber-400" : "text-amber-300"
                    }`}
                  >
                    {entry.playerInitials}
                  </div>
                  <div className="text-[10px] text-sky-300">
                    {entry.wordsFound} words · {entry.objectivesCompleted} obj
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-base ${isHighlighted ? "text-amber-300" : "text-amber-400"}`}>
                    {entry.score}
                  </div>
                  <div className="text-[10px] text-sky-300">{formatTimestamp(entry.timestamp)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )
    },
    [highlightInitials, fetchError],
  )

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
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
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>Refresh</span>}
            <span className="text-[10px]">({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
        {renderLeaderboard(hourlyLeaderboard, hourlyLoading, hourlyContainerRef)}
      </TabsContent>
      <TabsContent value="daily" className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-light tracking-wide text-sky-100">DAILY TOP SCORES</h3>
          <button
            onClick={refreshLeaderboards}
            className="text-xs text-sky-300 hover:text-sky-100 flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>Refresh</span>}
            <span className="text-[10px]">({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
        {renderLeaderboard(dailyLeaderboard, dailyLoading, dailyContainerRef)}
      </TabsContent>
      <TabsContent value="alltime" className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-light tracking-wide text-sky-100">ALL-TIME TOP SCORES</h3>
          <button
            onClick={refreshLeaderboards}
            className="text-xs text-sky-300 hover:text-sky-100 flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>Refresh</span>}
            <span className="text-[10px]">({lastRefreshed.toLocaleTimeString()})</span>
          </button>
        </div>
        {renderLeaderboard(allTimeLeaderboard, allTimeLoading, allTimeContainerRef)}
      </TabsContent>
    </Tabs>
  )
}
