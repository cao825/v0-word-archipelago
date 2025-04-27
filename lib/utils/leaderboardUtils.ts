// Types for leaderboard entries
export interface LeaderboardEntry {
  playerInitials: string
  score: number
  timestamp: number
  objectivesCompleted: number
  wordsFound: number
}

// Get leaderboard entries from localStorage
export function getLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  const entries = localStorage.getItem("wordArchipelago_leaderboard")
  return entries ? JSON.parse(entries) : []
}

// Format initials to be exactly 3 uppercase letters
export function formatInitials(input: string): string {
  // Convert to uppercase
  const upperCase = input.toUpperCase()

  // Remove any non-letter characters
  const lettersOnly = upperCase.replace(/[^A-Z]/g, "")

  // Pad with 'A's if less than 3 characters
  if (lettersOnly.length < 3) {
    return lettersOnly.padEnd(3, "A")
  }

  // Truncate to 3 characters if longer
  return lettersOnly.substring(0, 3)
}

// Add a new entry to the leaderboard
export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return

  // Ensure initials are formatted correctly
  entry.playerInitials = formatInitials(entry.playerInitials)

  const entries = getLeaderboardEntries()
  entries.push(entry)
  localStorage.setItem("wordArchipelago_leaderboard", JSON.stringify(entries))
}

// Get hourly leaderboard (top scores from the last hour)
export function getHourlyLeaderboard(): LeaderboardEntry[] {
  const entries = getLeaderboardEntries()
  const now = Date.now()
  const hourAgo = now - 60 * 60 * 1000

  return entries
    .filter((entry) => entry.timestamp >= hourAgo)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

// Get daily leaderboard (top scores from the last 24 hours)
export function getDailyLeaderboard(): LeaderboardEntry[] {
  const entries = getLeaderboardEntries()
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000

  return entries
    .filter((entry) => entry.timestamp >= dayAgo)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

// Get all-time leaderboard (top 10 scores)
export function getAllTimeLeaderboard(): LeaderboardEntry[] {
  const entries = getLeaderboardEntries()

  return entries.sort((a, b) => b.score - a.score).slice(0, 10)
}

// Format timestamp to readable date/time
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
