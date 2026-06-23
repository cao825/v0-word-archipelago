import { validateLeaderboardSubmission } from "../lib/services/leaderboardValidation"
import { MAX_LEADERBOARD_SCORE, MAX_LEADERBOARD_COUNTER } from "../lib/constants"

describe("validateLeaderboardSubmission", () => {
  const valid = { player_initials: "abc", score: 1200, words_found: 8, objectives_completed: 2 }

  it("accepts a well-formed submission and normalizes initials to uppercase", () => {
    const r = validateLeaderboardSubmission(valid)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.player_initials).toBe("ABC")
      expect(r.value.score).toBe(1200)
      expect(r.value.words_found).toBe(8)
      expect(r.value.objectives_completed).toBe(2)
    }
  })

  it("rejects a non-object body", () => {
    for (const body of [null, undefined, "x", 5, []]) {
      expect(validateLeaderboardSubmission(body).ok).toBe(false)
    }
  })

  // R1 — score bound + integer
  it("rejects an absurd score above the ceiling (the #59 999999999 case)", () => {
    const r = validateLeaderboardSubmission({ ...valid, score: 999_999_999 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/maximum/)
  })

  it("accepts a score exactly at the ceiling but not one above it", () => {
    expect(validateLeaderboardSubmission({ ...valid, score: MAX_LEADERBOARD_SCORE }).ok).toBe(true)
    expect(validateLeaderboardSubmission({ ...valid, score: MAX_LEADERBOARD_SCORE + 1 }).ok).toBe(false)
  })

  it("rejects a non-integer (float) score", () => {
    const r = validateLeaderboardSubmission({ ...valid, score: 1.5 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/integer/)
  })

  it("rejects zero, negative, and non-numeric scores", () => {
    expect(validateLeaderboardSubmission({ ...valid, score: 0 }).ok).toBe(false)
    expect(validateLeaderboardSubmission({ ...valid, score: -5 }).ok).toBe(false)
    expect(validateLeaderboardSubmission({ ...valid, score: "100" }).ok).toBe(false)
  })

  // R3 — initials shape (reject, not truncate)
  it("rejects HTML/script in initials instead of silently truncating", () => {
    const r = validateLeaderboardSubmission({ ...valid, player_initials: "<img src=x onerror=alert(1)>" })
    expect(r.ok).toBe(false)
  })

  it("rejects initials longer than 3 chars (no silent substring)", () => {
    expect(validateLeaderboardSubmission({ ...valid, player_initials: "ABCD" }).ok).toBe(false)
    expect(validateLeaderboardSubmission({ ...valid, player_initials: "A".repeat(10000) }).ok).toBe(false)
  })

  it("rejects empty / non-string / non-alphanumeric initials", () => {
    for (const pi of ["", "  ", "a b", "a!", 123, null]) {
      expect(validateLeaderboardSubmission({ ...valid, player_initials: pi }).ok).toBe(false)
    }
  })

  it("accepts 1-3 alphanumeric initials", () => {
    for (const pi of ["A", "ab", "X1z", "999"]) {
      expect(validateLeaderboardSubmission({ ...valid, player_initials: pi }).ok).toBe(true)
    }
  })

  // metadata counters — coerced, not trusted
  it("coerces bad counters to 0 and clamps huge ones", () => {
    const r = validateLeaderboardSubmission({ ...valid, words_found: -3, objectives_completed: 10 ** 9 })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.words_found).toBe(0)
      expect(r.value.objectives_completed).toBe(MAX_LEADERBOARD_COUNTER)
    }
  })

  // timestamp — optional, validated
  it("keeps a valid ISO timestamp, drops absent, rejects garbage", () => {
    const iso = "2026-06-22T12:00:00.000Z"
    const r = validateLeaderboardSubmission({ ...valid, timestamp: iso })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.timestamp).toBe(iso)
    expect(validateLeaderboardSubmission(valid).ok).toBe(true) // absent is fine
    expect(validateLeaderboardSubmission({ ...valid, timestamp: "not-a-date" }).ok).toBe(false)
  })
})
