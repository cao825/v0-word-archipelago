import { createClient } from "@supabase/supabase-js"

// Define the type for our leaderboard records
export interface LeaderboardRecord {
  id?: number
  player_initials: string
  score: number
  words_found: number
  objectives_completed: number
  timestamp: string
  created_at?: string
}

// Create a singleton instance of the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a server-side client for server components and API routes
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return createClient(supabaseUrl, supabaseServiceKey)
}
