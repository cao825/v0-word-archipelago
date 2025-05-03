// Types for leaderboard entries
import { supabase, type LeaderboardRecord } from "@/lib/supabase/client"

export interface LeaderboardEntry {
  playerInitials: string
  score: number
  timestamp: number
  objectivesCompleted: number
  wordsFound: number
}

// Maximum number of entries to store locally (as fallback)
const MAX_ENTRIES = 1000
const LEADERBOARD_STORAGE_KEY = "wordArchipelago_leaderboard"

// Convert Supabase record to LeaderboardEntry
function recordToEntry(record: LeaderboardRecord): LeaderboardEntry {
  return {
    playerInitials: record.player_initials,
    score: record.score,
    timestamp: new Date(record.timestamp).getTime(),
    objectivesCompleted: record.objectives_completed,
    wordsFound: record.words_found,
  }
}

// Convert LeaderboardEntry to Supabase record
function entryToRecord(entry: LeaderboardEntry): Omit<LeaderboardRecord, "id" | "created_at"> {
  return {
    player_initials: entry.playerInitials,
    score: entry.score,
    timestamp: new Date(entry.timestamp).toISOString(),
    objectives_completed: entry.objectivesCompleted,
    words_found: entry.wordsFound,
  }
}

// Get leaderboard entries with improved error handling and persistence
export async function fetchLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching from Supabase:", error)
      // Fall back to local storage
      return getLocalLeaderboardEntries()
    }

    if (!data || data.length === 0) {
      console.log("No leaderboard entries found in Supabase")
      return getLocalLeaderboardEntries()
    }

    // Convert Supabase records to LeaderboardEntry objects
    return data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchLeaderboardEntries:", error)
    // Fall back to local storage
    return getLocalLeaderboardEntries()
  }
}

// Fallback to local storage if Supabase is unavailable
export function getLocalLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  try {
    const entries = localStorage.getItem(LEADERBOARD_STORAGE_KEY)
    if (!entries) return []

    const parsedEntries = JSON.parse(entries)

    // If no entries exist, return empty array
    if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
      return []
    }

    // Validate and fix any corrupted entries
    const validatedEntries = parsedEntries.map((entry: any) => ({
      playerInitials: typeof entry.playerInitials === "string" ? entry.playerInitials : "AAA",
      score: typeof entry.score === "number" ? entry.score : 0,
      timestamp: typeof entry.timestamp === "number" ? entry.timestamp : Date.now(),
      objectivesCompleted: typeof entry.objectivesCompleted === "number" ? Math.min(3, entry.objectivesCompleted) : 0, // Ensure max 3 objectives
      wordsFound: typeof entry.wordsFound === "number" ? entry.wordsFound : 0,
    }))

    return validatedEntries
  } catch (error) {
    console.error("Error retrieving leaderboard entries:", error)
    return []
  }
}

// Get leaderboard entries - this is the main function that components will call
export function getLeaderboardEntries(): LeaderboardEntry[] {
  // For client-side rendering, we'll use local storage first and then update from Supabase
  if (typeof window === "undefined") return []

  // Get entries from local storage first for immediate display
  const localEntries = getLocalLeaderboardEntries()

  // Then fetch from Supabase and update
  fetchLeaderboardEntries()
    .then((entries) => {
      // Store the fetched entries in localStorage for offline access
      if (entries.length > 0) {
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries))

        // If the component using this function has a refresh callback, call it
        if (window.refreshLeaderboardDisplay) {
          window.refreshLeaderboardDisplay()
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching leaderboard entries:", error)
    })

  return localEntries
}

// Format initials to be exactly 3 uppercase letters
export function formatInitials(input: string): string {
  if (!input) return "AAA"

  // Sanitize input - only allow letters
  const sanitized = input.replace(/[^A-Za-z]/g, "")

  // Convert to uppercase
  const upperCase = sanitized.toUpperCase()

  // Pad with 'A's if less than 3 characters
  if (upperCase.length < 3) {
    return upperCase.padEnd(3, "A")
  }

  // Truncate to 3 characters if longer
  return upperCase.substring(0, 3)
}

// Add a new entry to the leaderboard with rate limiting and validation
export function addLeaderboardEntry(entry: LeaderboardEntry): boolean {
  if (typeof window === "undefined") return false

  try {
    console.log("Adding leaderboard entry:", entry)

    // Validate entry
    if (!entry || typeof entry.score !== "number" || entry.score <= 0) {
      console.error("Invalid leaderboard entry or score is 0 or negative")
      return false
    }

    // Ensure objectives count is valid (max 3)
    entry.objectivesCompleted = Math.min(3, entry.objectivesCompleted)

    // Rate limiting - only allow one submission every 5 seconds
    const lastSubmission = localStorage.getItem("wordArchipelago_lastSubmission")
    const now = Date.now()

    if (lastSubmission) {
      const lastTime = Number.parseInt(lastSubmission, 10)
      if (now - lastTime < 5000) {
        // 5 seconds
        console.warn("Rate limit exceeded for leaderboard submission")
        return false
      }
    }

    // Update last submission time
    localStorage.setItem("wordArchipelago_lastSubmission", now.toString())

    // Ensure initials are formatted correctly
    entry.playerInitials = formatInitials(entry.playerInitials)

    // Add to local storage first for immediate feedback
    const entries = getLocalLeaderboardEntries()
    entries.push(entry)
    const sortedEntries = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(sortedEntries))

    // Then add to Supabase
    const record = entryToRecord(entry)
    console.log("Submitting to Supabase:", record)

    // Use the API route for more reliable submission
    fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_initials: record.player_initials,
        score: record.score,
        words_found: record.words_found,
        objectives_completed: record.objectives_completed,
        timestamp: record.timestamp,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log("API response:", data)
        if (data.success) {
          console.log("Entry added via API successfully")

          // Refresh leaderboard data after successful submission
          setTimeout(() => {
            fetchLeaderboardEntries().then((entries) => {
              localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries))
              if (window.refreshLeaderboardDisplay) {
                window.refreshLeaderboardDisplay()
              }
            })
          }, 1000) // Small delay to allow the database to update
        }
      })
      .catch((error) => {
        console.error("Error submitting via API:", error)

        // Fallback to direct Supabase submission
        supabase
          .from("leaderboard")
          .insert([record])
          .then(({ error }) => {
            if (error) {
              console.error("Error adding entry to Supabase:", error)
            } else {
              console.log("Entry added to Supabase successfully")

              // Refresh leaderboard data after successful submission
              fetchLeaderboardEntries().then((entries) => {
                localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries))
                if (window.refreshLeaderboardDisplay) {
                  window.refreshLeaderboardDisplay()
                }
              })
            }
          })
          .catch((error) => {
            console.error("Error in Supabase insert:", error)
          })
      })

    return true
  } catch (error) {
    console.error("Error adding leaderboard entry:", error)
    return false
  }
}

// Get hourly leaderboard (top scores from the current hour)
export async function fetchHourlyLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    // Calculate the start of the current hour using the current date
    const now = new Date()
    const hourStart = new Date(now)
    hourStart.setMinutes(0, 0, 0)

    console.log("Fetching hourly leaderboard from:", hourStart.toISOString())

    // Use the API route for more reliable data
    const response = await fetch(`/api/leaderboard?timeframe=hourly`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log("No hourly leaderboard data found via API")

      // Fall back to direct Supabase query
      const { data: supabaseData, error } = await supabase
        .from("leaderboard")
        .select("*")
        .gte("timestamp", hourStart.toISOString())
        .order("score", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching hourly leaderboard from Supabase:", error)
        return getHourlyLeaderboard() // Fall back to local storage
      }

      if (!supabaseData || supabaseData.length === 0) {
        console.log("No hourly leaderboard data found in Supabase")
        return getHourlyLeaderboard() // Fall back to local storage
      }

      console.log(`Found ${supabaseData.length} hourly leaderboard entries in Supabase`)
      return supabaseData.map(recordToEntry)
    }

    console.log(`Found ${data.data.length} hourly leaderboard entries via API`)
    return data.data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchHourlyLeaderboard:", error)
    return getHourlyLeaderboard() // Fall back to local storage
  }
}

// Get hourly leaderboard from local storage (top scores from the current hour)
export function getHourlyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLocalLeaderboardEntries()
    const now = new Date()

    // Start of current hour
    const currentHourStart = new Date(now)
    currentHourStart.setMinutes(0, 0, 0)
    const currentHourStartTime = currentHourStart.getTime()

    console.log("Filtering local entries for current hour starting at:", new Date(currentHourStartTime).toISOString())

    const hourlyEntries = entries
      .filter((entry) => entry.timestamp >= currentHourStartTime)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    console.log(`Found ${hourlyEntries.length} local hourly entries`)
    return hourlyEntries
  } catch (error) {
    console.error("Error getting hourly leaderboard:", error)
    return []
  }
}

// Get daily leaderboard (top scores from the last 24 hours)
export async function fetchDailyLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    console.log("Fetching daily leaderboard")

    // Use the API route for more reliable data
    const response = await fetch(`/api/leaderboard?timeframe=daily`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log("No daily leaderboard data found via API")

      // Fall back to direct Supabase query
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)

      const { data: supabaseData, error } = await supabase
        .from("leaderboard")
        .select("*")
        .gte("timestamp", dayAgo.toISOString())
        .order("score", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching daily leaderboard from Supabase:", error)
        return getDailyLeaderboard() // Fall back to local storage
      }

      if (!supabaseData || supabaseData.length === 0) {
        console.log("No daily leaderboard data found in Supabase")
        return getDailyLeaderboard() // Fall back to local storage
      }

      console.log(`Found ${supabaseData.length} daily leaderboard entries in Supabase`)
      return supabaseData.map(recordToEntry)
    }

    console.log(`Found ${data.data.length} daily leaderboard entries via API`)
    return data.data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchDailyLeaderboard:", error)
    return getDailyLeaderboard() // Fall back to local storage
  }
}

// Get daily leaderboard from local storage (top scores from the last 24 hours)
export function getDailyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLocalLeaderboardEntries()
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000

    console.log("Filtering local entries for past 24 hours from:", new Date(dayAgo).toISOString())

    const dailyEntries = entries
      .filter((entry) => entry.timestamp >= dayAgo)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    console.log(`Found ${dailyEntries.length} local daily entries`)
    return dailyEntries
  } catch (error) {
    console.error("Error getting daily leaderboard:", error)
    return []
  }
}

// Get all-time leaderboard (top 10 scores)
export async function fetchAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    console.log("Fetching all-time leaderboard")

    // Use the API route for more reliable data
    const response = await fetch(`/api/leaderboard?timeframe=all`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log("No all-time leaderboard data found via API")

      // Fall back to direct Supabase query
      const { data: supabaseData, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching all-time leaderboard from Supabase:", error)
        return getAllTimeLeaderboard() // Fall back to local storage
      }

      if (!supabaseData || supabaseData.length === 0) {
        console.log("No all-time leaderboard data found in Supabase")
        return getAllTimeLeaderboard() // Fall back to local storage
      }

      console.log(`Found ${supabaseData.length} all-time leaderboard entries in Supabase`)
      return supabaseData.map(recordToEntry)
    }

    console.log(`Found ${data.data.length} all-time leaderboard entries via API`)
    return data.data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchAllTimeLeaderboard:", error)
    return getAllTimeLeaderboard() // Fall back to local storage
  }
}

// Get all-time leaderboard from local storage (top 10 scores)
export function getAllTimeLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLocalLeaderboardEntries()
    const allTimeEntries = entries.sort((a, b) => b.score - a.score).slice(0, 10)

    console.log(`Found ${allTimeEntries.length} local all-time entries`)
    return allTimeEntries
  } catch (error) {
    console.error("Error getting all-time leaderboard:", error)
    return []
  }
}

// Format timestamp to readable time (hours and minutes)
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Unknown time"
  }
}

// Format timestamp to include date for all-time leaderboard
export function formatTimestampWithDate(timestamp: number): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isThisYear = date.getFullYear() === now.getFullYear()

    // Format the time component
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (isToday) {
      // Today: "Today, 3:45 PM"
      return `Today, ${time}`
    } else if (isThisYear) {
      // This year: "Jan 15, 3:45 PM"
      return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`
    } else {
      // Previous years: "Jan 15 '23, 3:45 PM"
      return `${date.toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" })}, ${time}`
    }
  } catch (error) {
    console.error("Error formatting timestamp with date:", error)
    return "Unknown date"
  }
}

// Add a global refresh function that components can call
if (typeof window !== "undefined") {
  window.refreshLeaderboardDisplay = () => {
    // This will be implemented by the LeaderboardDisplay component
    console.log("Refresh function called but not implemented")
  }
}
