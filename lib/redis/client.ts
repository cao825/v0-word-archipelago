import { Redis } from "@upstash/redis"

// Create a singleton instance of the Redis client
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Define the type for our leaderboard records
export interface LeaderboardRecord {
  player_initials: string
  score: number
  words_found: number
  objectives_completed: number
  timestamp: string
}

// Redis key prefixes
export const LEADERBOARD_KEY = "leaderboard" // Sorted set for all-time scores
export const LEADERBOARD_DATA_KEY = "leaderboard:data" // Hash for entry metadata
