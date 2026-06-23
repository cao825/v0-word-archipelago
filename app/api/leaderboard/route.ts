import { NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { redis, LEADERBOARD_KEY, LEADERBOARD_DATA_KEY, type LeaderboardRecord } from "@/lib/redis/client"
import type { LeaderboardEntry } from "@/lib/utils/leaderboardUtils"
import { validateLeaderboardSubmission } from "@/lib/services/leaderboardValidation"
import { LEADERBOARD_RATE_LIMIT, LEADERBOARD_RATE_WINDOW_SECONDS } from "@/lib/constants"

// Redis-backed sliding-window rate limit (R2). MUST be Redis-backed: this runs on Vercel
// serverless, where in-memory counters do NOT persist across invocations, so a per-process
// counter would be useless. Keyed by client IP. Module-level singleton (reused across warm
// invocations); the @upstash/ratelimit slidingWindow is atomic (no INCR/EXPIRE race).
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(LEADERBOARD_RATE_LIMIT, `${LEADERBOARD_RATE_WINDOW_SECONDS} s`),
  prefix: "ratelimit:leaderboard",
  analytics: false,
})

// On Vercel the client IP arrives via x-forwarded-for (first hop) / x-real-ip.
function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

// Returns true if the write is ALLOWED. Fails OPEN on a Redis error — a rate-limit
// backend hiccup must not block legitimate score submissions (logged, not surfaced).
async function isWithinRateLimit(ip: string): Promise<boolean> {
  try {
    const { success } = await ratelimit.limit(ip)
    return success
  } catch (err) {
    console.error("Leaderboard rate-limit check failed; failing open:", err)
    return true
  }
}

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

    // R1 + R3 — strict, credential-free validation (pure; rejects rather than truncates).
    const result = validateLeaderboardSubmission(body)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    const submission = result.value

    // R2 — server-side rate limit (Redis-backed), keyed by client IP. Done after the
    // cheap validation so malformed floods are rejected without consuming a slot.
    const allowed = await isWithinRateLimit(getClientIp(request))
    if (!allowed) {
      return NextResponse.json({ error: "Too many submissions, please slow down." }, { status: 429 })
    }

    // Create the record from the validated, normalized submission.
    const entryId = generateEntryId()
    const record: LeaderboardRecord = {
      player_initials: submission.player_initials,
      score: submission.score,
      words_found: submission.words_found,
      objectives_completed: submission.objectives_completed,
      timestamp: submission.timestamp ?? new Date().toISOString(),
    }

    // Add to sorted set (score as the score, entryId as the member)
    await redis.zadd(LEADERBOARD_KEY, { score: submission.score, member: entryId })

    // Store entry data in hash
    await redis.hset(LEADERBOARD_DATA_KEY, { [entryId]: JSON.stringify(record) })

    console.log("Successfully added leaderboard entry for:", sanitizeForLog(submission.player_initials))
    return NextResponse.json({ success: true, message: "Leaderboard entry added successfully" })
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
