import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "all"

    let query = supabase.from("leaderboard").select("*")

    // Apply timeframe filters
    if (timeframe === "hourly") {
      const hourAgo = new Date()
      hourAgo.setMinutes(0, 0, 0) // Start of current hour
      query = query.gte("timestamp", hourAgo.toISOString())
    } else if (timeframe === "daily") {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      query = query.gte("timestamp", dayAgo.toISOString())
    }

    // Order by score descending
    query = query.order("score", { ascending: false })

    // Limit results
    query = query.limit(100)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // Validate the request body
    if (!body.player_initials || typeof body.score !== "number") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Insert the new leaderboard entry
    const { data, error } = await supabase.from("leaderboard").insert([
      {
        player_initials: body.player_initials.toUpperCase().substring(0, 3),
        score: body.score,
        words_found: body.words_found || 0,
        objectives_completed: body.objectives_completed || 0,
        timestamp: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error adding leaderboard entry:", error)
      return NextResponse.json({ error: "Failed to add leaderboard entry" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Leaderboard entry added successfully" })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
