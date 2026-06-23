import { test, expect } from "@playwright/test"

// Smoke: the production build boots and the pre-game shell renders cleanly.
// DOM/role/text selectors only — the island board is a <canvas>, so tile-level
// interaction is deferred to PR-B; here we assert the page mounts without errors.
test.describe("smoke", () => {
  test("loads the game with no uncaught errors", async ({ page }) => {
    const pageErrors: string[] = []
    page.on("pageerror", (err) => pageErrors.push(err.message))

    await page.goto("/")

    await expect(page).toHaveTitle(/Word Isles/i)
    // The island board renders to a <canvas>.
    await expect(page.locator("canvas").first()).toBeVisible()
    // Pre-game: the Start control is present (round button, aria-label "Start Game").
    await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible()
    // Pre-game has no active-game score bar.
    await expect(page.getByTestId("score-value")).toHaveCount(0)

    expect(pageErrors, `uncaught page errors: ${pageErrors.join("; ")}`).toEqual([])
  })
})
