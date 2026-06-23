import { MAX_LEADERBOARD_SCORE, MAX_LEADERBOARD_COUNTER } from "../constants"

// Pure server-side validation for a leaderboard write (no Redis, no DOM — unit-testable).
// Hardens the public POST /api/leaderboard endpoint against the gaps the #59 exploration
// found: R1 (no score bound / floats accepted) and R3 (initials passed through unsanitised
// and silently truncated). The route layers a Redis-backed rate limit (R2) on top.

export interface ValidLeaderboardSubmission {
  player_initials: string // 1-3 chars, uppercased, alphanumeric
  score: number // integer, 0 < score <= MAX_LEADERBOARD_SCORE
  words_found: number // integer, 0..MAX_LEADERBOARD_COUNTER
  objectives_completed: number // integer, 0..MAX_LEADERBOARD_COUNTER
  timestamp?: string // validated ISO string, or undefined (route defaults to now)
}

export type ValidationResult =
  | { ok: true; value: ValidLeaderboardSubmission }
  | { ok: false; error: string }

// Reject anything that isn't 1-3 ASCII alphanumerics — no HTML, control chars, or
// padding to silently truncate. Defence-in-depth even though React escapes on render.
const INITIALS_RE = /^[A-Za-z0-9]{1,3}$/

// Optional metadata counter → a safe non-negative integer (clamped), defaulting to 0.
function coerceCounter(v: unknown): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < 0) return 0
  return Math.min(v, MAX_LEADERBOARD_COUNTER)
}

export function validateLeaderboardSubmission(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body" }
  }
  const b = body as Record<string, unknown>

  // R3 — player_initials: reject (not truncate) anything outside 1-3 alphanumerics.
  if (typeof b.player_initials !== "string" || !INITIALS_RE.test(b.player_initials.trim())) {
    return { ok: false, error: "player_initials must be 1-3 alphanumeric characters" }
  }

  // R1 — score: must be a positive integer within a sane ceiling (floats were accepted).
  if (typeof b.score !== "number" || !Number.isInteger(b.score)) {
    return { ok: false, error: "score must be an integer" }
  }
  if (b.score <= 0) {
    return { ok: false, error: "Score must be greater than 0" }
  }
  if (b.score > MAX_LEADERBOARD_SCORE) {
    return { ok: false, error: `score exceeds the maximum of ${MAX_LEADERBOARD_SCORE}` }
  }

  // timestamp: optional; if present it must parse as a date. Default is filled by the route.
  let timestamp: string | undefined
  if (b.timestamp !== undefined && b.timestamp !== null) {
    if (typeof b.timestamp !== "string" || Number.isNaN(Date.parse(b.timestamp))) {
      return { ok: false, error: "timestamp must be an ISO date string" }
    }
    timestamp = b.timestamp
  }

  return {
    ok: true,
    value: {
      player_initials: b.player_initials.trim().toUpperCase(),
      score: b.score,
      words_found: coerceCounter(b.words_found),
      objectives_completed: coerceCounter(b.objectives_completed),
      timestamp,
    },
  }
}
