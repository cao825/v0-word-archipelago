// Types for leaderboard entries
export interface LeaderboardEntry {
  playerInitials: string
  score: number
  timestamp: number
  objectivesCompleted: number
  wordsFound: number
}

// Maximum number of entries to store
const MAX_ENTRIES = 1000

// Generate realistic leaderboard data if none exists
function generateInitialLeaderboardData(): LeaderboardEntry[] {
  const names = [
    "ACE",
    "BEN",
    "CAT",
    "DAN",
    "EVA",
    "FIN",
    "GUS",
    "HAL",
    "IVY",
    "JAY",
    "KIM",
    "LEO",
    "MAX",
    "NOA",
    "PAM",
  ]
  const entries: LeaderboardEntry[] = []

  // Generate 20 realistic entries
  for (let i = 0; i < 20; i++) {
    const nameIndex = Math.floor(Math.random() * names.length)
    const score = Math.floor(Math.random() * 500) + 200 // Scores between 200-700
    const wordsFound = Math.floor(Math.random() * 20) + 5 // 5-25 words
    const objectivesCompleted = Math.floor(Math.random() * 5) + 1 // 1-5 objectives

    // Create timestamps within the last week
    const daysAgo = Math.floor(Math.random() * 7)
    const hoursAgo = Math.floor(Math.random() * 24)
    const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000

    entries.push({
      playerInitials: names[nameIndex],
      score,
      timestamp,
      objectivesCompleted,
      wordsFound,
    })
  }

  // Sort by score (highest first)
  return entries.sort((a, b) => b.score - a.score)
}

// Modify the getLeaderboardEntries function to initialize with data if empty
export function getLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  try {
    const entries = localStorage.getItem("wordArchipelago_leaderboard")
    const parsedEntries = entries ? JSON.parse(entries) : []

    // If no entries exist, generate initial data
    if (parsedEntries.length === 0) {
      const initialData = generateInitialLeaderboardData()
      localStorage.setItem("wordArchipelago_leaderboard", JSON.stringify(initialData))
      return initialData
    }

    return parsedEntries
  } catch (error) {
    console.error("Error retrieving leaderboard entries:", error)
    return []
  }
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

    // Rate limiting - only allow one submission every 10 seconds
    const lastSubmission = localStorage.getItem("wordArchipelago_lastSubmission")
    const now = Date.now()

    if (lastSubmission) {
      const lastTime = Number.parseInt(lastSubmission, 10)
      if (now - lastTime < 10000) {
        // 10 seconds
        console.warn("Rate limit exceeded for leaderboard submission")
        return false
      }
    }

    // Update last submission time
    localStorage.setItem("wordArchipelago_lastSubmission", now.toString())

    // Ensure initials are formatted correctly
    entry.playerInitials = formatInitials(entry.playerInitials)

    // Get existing entries
    const entries = getLeaderboardEntries()

    // Add new entry
    entries.push(entry)

    // Sort by score (highest first) and limit to MAX_ENTRIES
    const sortedEntries = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)

    // Save back to localStorage
    localStorage.setItem("wordArchipelago_leaderboard", JSON.stringify(sortedEntries))

    return true
  } catch (error) {
    console.error("Error adding leaderboard entry:", error)
    return false
  }
}

// Get hourly leaderboard (top scores from the last hour)
export function getHourlyLeaderboard(): LeaderboardEntry[] {
  try {
    const entries = getLeaderboardEntries()
    const now = Date.now()
    const hourAgo = now - 60 * 60 * 1000

    return entries
      .filter((entry) => entry.timestamp >= hourAgo)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  } catch (error) {
    console.error("Error getting hourly leaderboard:", error)
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
    return date.toLocaleString()
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Unknown date"
  }
}
