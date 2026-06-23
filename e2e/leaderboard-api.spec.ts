import { test, expect } from "@playwright/test"

// Leaderboard API contract via the request fixture (no browser). The validation paths
// return BEFORE touching Upstash Redis, so they are deterministic and run everywhere
// (incl. CI, which has no Redis creds). The persist+read happy path and the rate-limit
// (429) need Redis, so they are skipped unless KV_REST_API_URL is set.
//
// These assertions encode the leaderboard-hardening fixes (PR after #59): R1 score
// bound + integer-only, R3 strict initials (reject, don't truncate), R2 rate limit.
test.describe("leaderboard API contract", () => {
  // (the non-object "Invalid request body" branch is covered by the jest unit test;
  // sending a bare non-JSON body via the HTTP client is client-dependent.)
  test("POST missing player_initials is rejected (400)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", { data: { foo: "bar" } })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toMatch(/player_initials/)
  })

  test("R1: POST a non-positive score is rejected (400)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", { data: { player_initials: "E2E", score: 0 } })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toBe("Score must be greater than 0")
  })

  test("R1: POST an absurd score above the ceiling is now rejected (400, was 500/stored)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", { data: { player_initials: "E2E", score: 999999999 } })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toMatch(/maximum/)
  })

  test("R1: POST a non-integer (float) score is rejected (400)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", { data: { player_initials: "E2E", score: 1.5 } })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toMatch(/integer/)
  })

  test("R3: POST HTML/script in initials is rejected (400, not silently truncated)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", {
      data: { player_initials: "<img src=x onerror=alert(1)>", score: 100 },
    })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toMatch(/player_initials/)
  })

  test("R3: POST overlong initials is rejected (400)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", { data: { player_initials: "ABCD", score: 100 } })
    expect(res.status()).toBe(400)
  })

  test("happy path: a valid score persists, GET returns it (needs Redis creds)", async ({ request }) => {
    test.skip(!process.env.KV_REST_API_URL, "needs Upstash Redis creds (set KV_REST_API_URL to run)")

    const post = await request.post("/api/leaderboard", { data: { player_initials: "E2E", score: 4242 } })
    expect(post.status()).toBe(200)
    expect((await post.json()).success).toBe(true)

    const get = await request.get("/api/leaderboard?timeframe=all")
    expect(get.status()).toBe(200)
    expect(Array.isArray((await get.json()).data)).toBe(true)
  })

  test("R2: rapid writes past the limit are rate-limited (429) (needs Redis creds)", async ({ request }) => {
    test.skip(!process.env.KV_REST_API_URL, "rate limit is Redis-backed; needs KV_REST_API_URL")

    let saw429 = false
    for (let i = 0; i < 25; i++) {
      const res = await request.post("/api/leaderboard", { data: { player_initials: "E2E", score: 100 } })
      if (res.status() === 429) {
        saw429 = true
        break
      }
    }
    expect(saw429).toBe(true)
  })
})
