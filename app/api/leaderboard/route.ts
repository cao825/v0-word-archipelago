import { NextResponse } from "next/server"
import { redis, LEADERBOARD_KEY, LEADERBOARD_DATA_KEY, type LeaderboardRecord } from "@/lib/redis/client"
import type { LeaderboardEntry } from "@/lib/utils/leaderboardUtils"

// Neutralize log injection (CWE-117): strip CR/LF/line-separators and other
// control chars from attacker-controlled values before they reach a log sink,
// so a request can't forge log lines. Keeps the real value, just newline-safe.
function sanitizeForLog(value: string): string {
  return value.replace(/[\r\n\u2028\u2029]+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "")
}

// Helper to generate unique entry ID
function generateEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Convert Redis data to LeaderboardEntry
function recordToEntry(record: LeaderboardRecord & { id: string }): LeaderboardEntry {
  return {
    playerInitials: record.player_initials,
    score: record.score,
    timestamp: new Date(record.timestamp).getTime(),
    objectivesCompleted: record.objectives_completed,
    wordsFound: record.words_found,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "all"

    // Get top scores from sorted set (highest first)
    const topEntryIds = await redis.zrange(LEADERBOARD_KEY, 0, 99, { rev: true })

    if (!topEntryIds || topEntryIds.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get all entry data from hash
    const entries: LeaderboardEntry[] = []

    for (const entryId of topEntryIds) {
      const entryData = await redis.hget(LEADERBOARD_DATA_KEY, entryId as string)
      if (entryData) {
        const record = typeof entryData === "string" ? JSON.parse(entryData) : entryData
        const entry = recordToEntry({ ...record, id: entryId as string })

        // Apply timeframe filters
        if (timeframe === "hourly") {
          const hourStart = new Date()
          hourStart.setMinutes(0, 0, 0)
          if (entry.timestamp >= hourStart.getTime()) {
            entries.push(entry)
          }
        } else if (timeframe === "daily") {
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000
          if (entry.timestamp >= dayAgo) {
            entries.push(entry)
          }
        } else {
          entries.push(entry)
        }
      }
    }

    // Sort by score (should already be sorted, but ensure consistency)
    entries.sort((a, b) => b.score - a.score)

    return NextResponse.json({ data: entries.slice(0, 100) })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("Received leaderboard submission:", sanitizeForLog(JSON.stringify(body)))

    // Validate the request body
    if (!body.player_initials || typeof body.score !== "number") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (body.score <= 0) {
      return NextResponse.json({ error: "Score must be greater than 0" }, { status: 400 })
    }

    // Format the initials
    const formattedInitials = body.player_initials.toUpperCase().substring(0, 3)

    // Create the record
    const entryId = generateEntryId()
    const record: LeaderboardRecord = {
      player_initials: formattedInitials,
      score: body.score,
      words_found: body.words_found || 0,
      objectives_completed: body.objectives_completed || 0,
      timestamp: body.timestamp || new Date().toISOString(),
    }

    // Add to sorted set (score as the score, entryId as the member)
    await redis.zadd(LEADERBOARD_KEY, { score: body.score, member: entryId })

    // Store entry data in hash
    await redis.hset(LEADERBOARD_DATA_KEY, { [entryId]: JSON.stringify(record) })

    console.log("Successfully added leaderboard entry for:", sanitizeForLog(formattedInitials))
    return NextResponse.json({ success: true, message: "Leaderboard entry added successfully" })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
