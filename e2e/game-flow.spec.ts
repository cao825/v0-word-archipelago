import { test, expect } from "@playwright/test"

// Core DOM flow: start the game and assert the active-game chrome + control
// invariants. Tile selection is canvas-based (PR-B); here we assert what the DOM
// exposes deterministically — start transition, initial score, disabled controls.
test.describe("game flow", () => {
  test("starting the game shows the score bar and disabled controls", async ({ page }) => {
    await page.goto("/")

    await page.getByRole("button", { name: "Start Game" }).click()

    // Active game: the score bar mounts at 0.
    await expect(page.getByTestId("score-value")).toHaveText("0")

    // Submit + Clear appear and are DISABLED with nothing selected (the invariant —
    // no selection means no submittable word).
    await expect(page.getByRole("button", { name: "Submit word" })).toBeDisabled()
    await expect(page.getByRole("button", { name: "Clear selection" })).toBeDisabled()
  })
})
