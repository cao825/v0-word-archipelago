import { test, expect } from "@playwright/test"

// Leaderboard API contract via the request fixture (no browser). The validation
// paths return BEFORE touching Upstash Redis, so they are deterministic and run
// everywhere (incl. CI, which has no Redis creds). The persist+read happy path
// needs Redis, so it is skipped unless KV_REST_API_URL is set — this also seeds
// PR-B's endpoint-robustness probing.
test.describe("leaderboard API contract", () => {
  test("POST with a malformed body is rejected (400)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", { data: { foo: "bar" } })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toBe("Invalid request body")
  })

  test("POST with a non-positive score is rejected (400)", async ({ request }) => {
    const res = await request.post("/api/leaderboard", {
      data: { player_initials: "E2E", score: 0 },
    })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toBe("Score must be greater than 0")
  })

  test("POST a valid score persists and GET returns the board", async ({ request }) => {
    test.skip(!process.env.KV_REST_API_URL, "needs Upstash Redis creds (set KV_REST_API_URL to run)")

    const post = await request.post("/api/leaderboard", {
      data: { player_initials: "E2E", score: 4242 },
    })
    expect(post.status()).toBe(200)
    expect((await post.json()).success).toBe(true)

    const get = await request.get("/api/leaderboard?timeframe=all")
    expect(get.status()).toBe(200)
    expect(Array.isArray((await get.json()).data)).toBe(true)
  })
})
