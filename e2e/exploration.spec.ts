import { test, expect } from "@playwright/test"
import { POINTS_PER_LETTER } from "../lib/constants"
import {
  startGame,
  discoverTiles,
  formValidWord,
  submit,
  readWord,
  readScore,
  clearSelection,
} from "./helpers/canvas-play"

// EXPLORATION harness (PR-B) — drives real canvas play and OBSERVES (it does not gate).
// Skipped in CI so it never destabilises the PR-A suite; run locally:
//   pnpm exec playwright test exploration --reporter=line
// Findings are written up in e2e/EXPLORATION-FINDINGS.md.
test.skip(!!process.env.CI, "exploration harness — run locally, not a CI gate")

test("explore: discover the board, play a word, probe edge states", async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const failedRequests: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text())
  })
  page.on("pageerror", (e) => pageErrors.push(e.message))
  page.on("requestfailed", (r) => failedRequests.push(`${r.method()} ${r.url()} — ${r.failure()?.errorText}`))
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(`HTTP ${r.status()} ${r.url()}`)
  })

  await startGame(page)
  test.setTimeout(180_000)

  const tiles = await discoverTiles(page)
  console.log(`\n=== BOARD: discovered ${tiles.length} tiles: ${tiles.map((t) => t.letter).join(" ")} ===`)

  const word = await formValidWord(page, tiles)
  if (word) {
    const before = await readScore(page)
    await submit(page)
    const after = await readScore(page)
    const expected = word.length * POINTS_PER_LETTER
    console.log(`=== PLAY: word="${word}" (len ${word.length}) score ${before}->${after} (Δ${after - before}, base-expected ${expected}; a tile multiplier can raise it) ===`)

    // Edge: duplicate — replay the SAME word.
    const dupWord = await formValidWord(page, tiles)
    if (dupWord === word) {
      const dupBefore = await readScore(page)
      await submit(page)
      console.log(`=== EDGE duplicate: replayed "${dupWord}", score ${dupBefore}->${await readScore(page)} (should NOT increase) ===`)
    }
  } else {
    console.log("=== PLAY: no valid word formed from discovered tiles (greedy) ===")
  }

  // Edge: too-short (single tile) submit.
  await clearSelection(page)
  if (tiles[0]) await page.mouse.click(tiles[0].sx, tiles[0].sy)
  await submit(page)
  console.log(`=== EDGE too-short: single-tile submit → word="${await readWord(page)}" score=${await readScore(page)} ===`)

  console.log(`\n=== OBSERVED ERRORS ===`)
  console.log(`console.error (${consoleErrors.length}):\n${consoleErrors.slice(0, 20).join("\n")}`)
  console.log(`pageerror (${pageErrors.length}):\n${pageErrors.join("\n")}`)
  console.log(`failed/4xx-5xx requests (${failedRequests.length}):\n${failedRequests.slice(0, 20).join("\n")}`)

  expect(true).toBe(true) // harness never fails on observations
})
