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
  formatTimestampWithDate,
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

  // Track if initial scroll has happened
  const initialScrollCompletedRef = useRef<{
    hourly: boolean
    daily: boolean
    alltime: boolean
  }>({
    hourly: false,
    daily: false,
    alltime: false,
  })

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

      // Reset scroll flags when refreshing data
      initialScrollCompletedRef.current = {
        hourly: false,
        daily: false,
        alltime: false,
      }
    } catch (error) {
      console.error("Error refreshing leaderboards:", error)

      // Implement retry with exponential backoff
      if (retryCount < maxRetries) {
        const backoffTime = Math.pow(2, retryCount) * 1000 // Exponential backoff
        console.log(`Retrying in ${backoffTime}ms (attempt ${retryCount + 1}/${maxRetries})`)

        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          // eslint-disable-next-line react-hooks/immutability -- Intentional self-referential retry: the callback re-invokes itself on the exponential-backoff timer; `retryCount` in the deps array gives it a fresh identity each attempt.
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
  // eslint-disable-next-line react-hooks/immutability -- Intentional cross-component bridge: publishes the imperative handle on `window` so sibling components can trigger a submit without prop-drilling.
  ;(window as any).submitLeaderboardScore = submitScore

  // Export the refresh function so it can be called from elsewhere
  // eslint-disable-next-line react-hooks/immutability -- Intentional cross-component bridge: publishes the imperative refresh handle on `window` (same pattern as submitLeaderboardScore above).
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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- One-time tab selection gated by `initialTabSetRef` (set below), so this focuses the highlighted entry's tab exactly once per `highlightInitials` change rather than looping.
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

    // Reset scroll flags when highlightInitials changes
    initialScrollCompletedRef.current = {
      hourly: false,
      daily: false,
      alltime: false,
    }
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
    (
      entries: LeaderboardEntry[],
      isLoadingState: boolean,
      containerRef: React.RefObject<HTMLDivElement | null>,
      tabKey: "hourly" | "daily" | "alltime",
    ) => {
      if (fetchError) {
        return (
          <div className="flex items-center justify-center py-8 text-red-400 w-full">
            <p>{fetchError}</p>
          </div>
        )
      }

      if (isLoadingState && entries.length === 0) {
        return (
          <div className="flex items-center justify-center py-8 w-full">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            <span className="ml-2 text-sky-400">Loading leaderboard...</span>
          </div>
        )
      }

      if (entries.length === 0) {
        return <p className="text-center text-sky-400 py-4 text-sm w-full">No entries yet</p>
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
        <div
          ref={containerRef}
          className="space-y-1.5 overflow-y-auto pr-1 leaderboard-container w-full"
          style={{
            scrollBehavior: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
            width: "100%",
            maxWidth: "100%",
            maxHeight: "250px", // Ensure consistent max height
          }}
        >
          {entries.map((entry, index) => {
            // Check if this entry should be highlighted (only highlight the most recent matching entry)
            const isHighlighted =
              highlightInitials &&
              mostRecentMatchingEntry &&
              entry.playerInitials === highlightInitials &&
              entry.timestamp === mostRecentMatchingEntry.timestamp

            // Format timestamp based on tab
            const formattedTime =
              tabKey === "alltime" ? formatTimestampWithDate(entry.timestamp) : formatTimestamp(entry.timestamp)

            return (
              <div
                key={`${entry.playerInitials}-${entry.timestamp}-${index}`}
                className={`bg-sky-900 rounded-md p-1.5 flex items-center border w-full ${
                  isHighlighted ? "border-amber-400 shadow-lg shadow-amber-400/20 animate-pulse" : "border-sky-700"
                }`}
                ref={
                  isHighlighted && !initialScrollCompletedRef.current[tabKey]
                    ? (el) => {
                        // Scroll to the highlighted element only once
                        if (el && containerRef.current) {
                          // Use a more gentle scroll that doesn't lock the scrolling
                          setTimeout(() => {
                            // Calculate the scroll position to center the element
                            const containerHeight = containerRef.current?.clientHeight || 0
                            const elementTop = el.offsetTop
                            const elementHeight = el.clientHeight
                            const centerPosition = elementTop - containerHeight / 2 + elementHeight / 2

                            // Scroll to position
                            if (containerRef.current) {
                              containerRef.current.scrollTop = centerPosition
                              initialScrollCompletedRef.current[tabKey] = true
                            }
                          }, 100)
                        }
                      }
                    : undefined
                }
              >
                {/* Rank circle */}
                <div className="w-6 h-6 min-w-6 rounded-full bg-amber-600 flex items-center justify-center font-bold mr-2 text-xs">
                  {index + 1}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-0.5">
                    <div
                      className={`bg-sky-950 px-2 py-0.5 rounded-md font-mono font-bold tracking-wider mr-2 uppercase text-xs ${
                        isHighlighted ? "text-amber-300 ring-2 ring-amber-400" : "text-amber-300"
                      }`}
                    >
                      {entry.playerInitials}
                    </div>
                    <div className="text-[10px] text-sky-300 truncate">
                      {entry.wordsFound} words · {entry.objectivesCompleted} obj
                    </div>
                  </div>

                  {/* Date/time for all-time tab */}
                  {tabKey === "alltime" && <div className="text-[10px] text-sky-300 truncate">{formattedTime}</div>}
                </div>

                {/* Score and time */}
                <div className="text-right ml-2 flex flex-col items-end min-w-[60px]">
                  <div className={`font-bold text-base ${isHighlighted ? "text-amber-300" : "text-amber-400"}`}>
                    {entry.score}
                  </div>
                  {/* Only show time for hourly and daily tabs */}
                  {tabKey !== "alltime" && <div className="text-[10px] text-sky-300">{formattedTime}</div>}
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
    <div className="w-full">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 bg-sky-900 w-full">
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
        <TabsContent value="hourly" className="mt-2 w-full">
          <div className="flex justify-between items-center mb-2 w-full">
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
          {/* eslint-disable-next-line react-hooks/refs -- renderLeaderboard reads scroll refs to auto-center a freshly-highlighted entry; the ref access is gated by `initialScrollCompletedRef` and runs inside a callback ref, not to drive rendering. */}
          {renderLeaderboard(hourlyLeaderboard, hourlyLoading, hourlyContainerRef, "hourly")}
        </TabsContent>
        <TabsContent value="daily" className="mt-2 w-full">
          <div className="flex justify-between items-center mb-2 w-full">
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
          {/* eslint-disable-next-line react-hooks/refs -- renderLeaderboard reads scroll refs to auto-center a freshly-highlighted entry (see hourly tab above). */}
          {renderLeaderboard(dailyLeaderboard, dailyLoading, dailyContainerRef, "daily")}
        </TabsContent>
        <TabsContent value="alltime" className="mt-2 h-full flex flex-col w-full">
          <div className="flex justify-between items-center mb-2 w-full">
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
          {/* eslint-disable-next-line react-hooks/refs -- renderLeaderboard reads scroll refs to auto-center a freshly-highlighted entry (see hourly tab above). */}
          {renderLeaderboard(allTimeLeaderboard, allTimeLoading, allTimeContainerRef, "alltime")}
        </TabsContent>
      </Tabs>
      <style jsx global>{`
        .leaderboard-container {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: rgba(56, 189, 248, 0.5) rgba(7, 89, 133, 0.1);
          width: 100%;
          max-height: 250px !important; /* Force max height with !important */
          overflow-y: auto !important; /* Force overflow with !important */
        }
        .leaderboard-container::-webkit-scrollbar {
          width: 6px;
        }
        .leaderboard-container::-webkit-scrollbar-track {
          background: rgba(7, 89, 133, 0.1);
          border-radius: 3px;
        }
        .leaderboard-container::-webkit-scrollbar-thumb {
          background-color: rgba(56, 189, 248, 0.5);
          border-radius: 3px;
        }
        
        /* Ensure modal content doesn't overflow on desktop */
        @media (min-width: 768px) {
          .leaderboard-container {
            max-height: 250px !important;
            overflow-y: auto !important;
          }
        }
      `}</style>
    </div>
  )
}
