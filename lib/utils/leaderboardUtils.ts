// Types for leaderboard entries
import {
  MAX_LEADERBOARD_ENTRIES,
  LEADERBOARD_DISPLAY_LIMIT,
  LEADERBOARD_SUBMISSION_COOLDOWN_MS,
} from "../constants"

export interface LeaderboardEntry {
  playerInitials: string
  score: number
  timestamp: number
  objectivesCompleted: number
  wordsFound: number
}

const LEADERBOARD_STORAGE_KEY = "wordArchipelago_leaderboard"

// Get leaderboard entries from localStorage (fallback)
export function getLocalLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  try {
    const entries = localStorage.getItem(LEADERBOARD_STORAGE_KEY)
    if (!entries) return []

    const parsedEntries = JSON.parse(entries)

    if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
      return []
    }

    // Validate and fix any corrupted entries
    const validatedEntries = parsedEntries.map((entry: any) => ({
      playerInitials: typeof entry.playerInitials === "string" ? entry.playerInitials : "AAA",
      score: typeof entry.score === "number" ? entry.score : 0,
      timestamp: typeof entry.timestamp === "number" ? entry.timestamp : Date.now(),
      objectivesCompleted: typeof entry.objectivesCompleted === "number" ? Math.min(3, entry.objectivesCompleted) : 0,
      wordsFound: typeof entry.wordsFound === "number" ? entry.wordsFound : 0,
    }))

    return validatedEntries
  } catch (error) {
    console.error("Error retrieving leaderboard entries:", error)
    return []
  }
}

// Fetch leaderboard from API
export async function fetchLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch("/api/leaderboard?timeframe=all")
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return getLocalLeaderboardEntries()
    }

    return data.data
  } catch (error) {
    console.error("Error fetching leaderboard entries:", error)
    return getLocalLeaderboardEntries()
  }
}

// Get leaderboard entries - main function for components
export function getLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  const localEntries = getLocalLeaderboardEntries()

  // Fetch from API and update localStorage
  fetchLeaderboardEntries()
    .then((entries) => {
      if (entries.length > 0) {
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries))

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

  const sanitized = input.replace(/[^A-Za-z]/g, "")
  const upperCase = sanitized.toUpperCase()

  if (upperCase.length < 3) {
    return upperCase.padEnd(3, "A")
  }

  return upperCase.substring(0, 3)
}

// Add a new entry to the leaderboard
export function addLeaderboardEntry(entry: LeaderboardEntry): boolean {
  if (typeof window === "undefined") return false

  try {
    console.log("Adding leaderboard entry:", entry)

    if (!entry || typeof entry.score !== "number" || entry.score <= 0) {
      console.error("Invalid leaderboard entry or score is 0 or negative")
      return false
    }

    entry.objectivesCompleted = Math.min(3, entry.objectivesCompleted)

    // Rate limiting
    const lastSubmission = localStorage.getItem("wordArchipelago_lastSubmission")
    const now = Date.now()

    if (lastSubmission) {
      const lastTime = Number.parseInt(lastSubmission, 10)
      if (now - lastTime < LEADERBOARD_SUBMISSION_COOLDOWN_MS) {
        console.warn("Rate limit exceeded for leaderboard submission")
        return false
      }
    }

    localStorage.setItem("wordArchipelago_lastSubmission", now.toString())
    entry.playerInitials = formatInitials(entry.playerInitials)

    // Add to local storage first
    const entries = getLocalLeaderboardEntries()
    entries.push(entry)
    const sortedEntries = entries.sort((a, b) => b.score - a.score).slice(0, MAX_LEADERBOARD_ENTRIES)
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(sortedEntries))

    // Submit to API
    fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_initials: entry.playerInitials,
        score: entry.score,
        words_found: entry.wordsFound,
        objectives_completed: entry.objectivesCompleted,
        timestamp: new Date(entry.timestamp).toISOString(),
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

          setTimeout(() => {
            fetchLeaderboardEntries().then((entries) => {
              localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries))
              if (window.refreshLeaderboardDisplay) {
                window.refreshLeaderboardDisplay()
              }
            })
          }, 1000)
        }
      })
      .catch((error) => {
        console.error("Error submitting via API:", error)
      })

    return true
  } catch (error) {
    console.error("Error adding leaderboard entry:", error)
    return false
  }
}

// Fetch hourly leaderboard
export async function fetchHourlyLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`/api/leaderboard?timeframe=hourly`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return getHourlyLeaderboard()
    }

    return data.data
  } catch (error) {
    console.error("Error in fetchHourlyLeaderboard:", error)
    return getHourlyLeaderboard()
  }
}

// Get hourly leaderboard from local storage
export function getHourlyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLocalLeaderboardEntries()
    const now = new Date()

    const currentHourStart = new Date(now)
    currentHourStart.setMinutes(0, 0, 0)
    const currentHourStartTime = currentHourStart.getTime()

    const hourlyEntries = entries
      .filter((entry) => entry.timestamp >= currentHourStartTime)
      .sort((a, b) => b.score - a.score)
      .slice(0, LEADERBOARD_DISPLAY_LIMIT)

    return hourlyEntries
  } catch (error) {
    console.error("Error getting hourly leaderboard:", error)
    return []
  }
}

// Fetch daily leaderboard
export async function fetchDailyLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`/api/leaderboard?timeframe=daily`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return getDailyLeaderboard()
    }

    return data.data
  } catch (error) {
    console.error("Error in fetchDailyLeaderboard:", error)
    return getDailyLeaderboard()
  }
}

// Get daily leaderboard from local storage
export function getDailyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLocalLeaderboardEntries()
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000

    const dailyEntries = entries
      .filter((entry) => entry.timestamp >= dayAgo)
      .sort((a, b) => b.score - a.score)
      .slice(0, LEADERBOARD_DISPLAY_LIMIT)

    return dailyEntries
  } catch (error) {
    console.error("Error getting daily leaderboard:", error)
    return []
  }
}

// Fetch all-time leaderboard
export async function fetchAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`/api/leaderboard?timeframe=all`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return getAllTimeLeaderboard()
    }

    return data.data
  } catch (error) {
    console.error("Error in fetchAllTimeLeaderboard:", error)
    return getAllTimeLeaderboard()
  }
}

// Get all-time leaderboard from local storage
export function getAllTimeLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLocalLeaderboardEntries()
    const allTimeEntries = entries.sort((a, b) => b.score - a.score).slice(0, LEADERBOARD_DISPLAY_LIMIT)

    return allTimeEntries
  } catch (error) {
    console.error("Error getting all-time leaderboard:", error)
    return []
  }
}

// Format timestamp to readable time
export function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp)
    // An invalid timestamp (e.g. NaN) yields an Invalid Date whose
    // toLocaleTimeString() returns "Invalid Date" rather than throwing, so the
    // catch below never fires. Guard explicitly to honor graceful handling.
    if (isNaN(date.getTime())) {
      return "Unknown time"
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Unknown time"
  }
}

// Format timestamp to include date
export function formatTimestampWithDate(timestamp: number): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isThisYear = date.getFullYear() === now.getFullYear()

    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    if (isToday) {
      return `Today, ${time}`
    } else if (isThisYear) {
      return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`
    } else {
      return `${date.toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" })}, ${time}`
    }
  } catch (error) {
    console.error("Error formatting timestamp with date:", error)
    return "Unknown date"
  }
}

// Global refresh function
if (typeof window !== "undefined") {
  window.refreshLeaderboardDisplay = () => {
    console.log("Refresh function called but not implemented")
  }
}
