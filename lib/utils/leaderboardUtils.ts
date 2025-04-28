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
    const parsedEntries = entries ? JSON.parse(entries) : []

    // If no entries exist, return empty array
    if (parsedEntries.length === 0) {
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
    // Validate entry
    if (!entry || typeof entry.score !== "number" || entry.score < 0) {
      console.error("Invalid leaderboard entry")
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

    return true
  } catch (error) {
    console.error("Error adding leaderboard entry:", error)
    return false
  }
}

// Get hourly leaderboard (top scores from the current hour)
export async function fetchHourlyLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const hourAgo = new Date()
    hourAgo.setHours(hourAgo.getHours() - 1)

    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .gte("timestamp", hourAgo.toISOString())
      .order("score", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching hourly leaderboard:", error)
      return []
    }

    return data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchHourlyLeaderboard:", error)
    return []
  }
}

// Get hourly leaderboard (top scores from the current hour)
export function getHourlyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLeaderboardEntries()
    const now = new Date()

    // Start of current hour
    const currentHourStart = new Date(now)
    currentHourStart.setMinutes(0, 0, 0)

    return entries
      .filter((entry) => entry.timestamp >= currentHourStart.getTime())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  } catch (error) {
    console.error("Error getting hourly leaderboard:", error)
    return []
  }
}

// Get daily leaderboard (top scores from the last 24 hours)
export async function fetchDailyLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const dayAgo = new Date()
    dayAgo.setDate(dayAgo.getDate() - 1)

    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .gte("timestamp", dayAgo.toISOString())
      .order("score", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching daily leaderboard:", error)
      return []
    }

    return data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchDailyLeaderboard:", error)
    return []
  }
}

// Get daily leaderboard (top scores from the last 24 hours)
export function getDailyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLeaderboardEntries()
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000

    return entries
      .filter((entry) => entry.timestamp >= dayAgo)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  } catch (error) {
    console.error("Error getting daily leaderboard:", error)
    return []
  }
}

// Get all-time leaderboard (top 10 scores)
export async function fetchAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching all-time leaderboard:", error)
      return []
    }

    return data.map(recordToEntry)
  } catch (error) {
    console.error("Error in fetchAllTimeLeaderboard:", error)
    return []
  }
}

// Get all-time leaderboard (top 10 scores)
export function getAllTimeLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLeaderboardEntries()
    return entries.sort((a, b) => b.score - a.score).slice(0, 10)
  } catch (error) {
    console.error("Error getting all-time leaderboard:", error)
    return []
  }
}

// Format timestamp to readable date/time
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Unknown time"
  }
}

// Add a global refresh function that components can call
if (typeof window !== "undefined") {
  window.refreshLeaderboardDisplay = () => {
    // This will be implemented by the LeaderboardDisplay component
    console.log("Refresh function called but not implemented")
  }
}
