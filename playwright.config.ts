import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright E2E — SEPARATE from `pnpm test` (jest unit, 90/90). Run via
 * `pnpm test:e2e`. Boots the BUILT production app (`pnpm build && pnpm start`) and
 * drives the real DOM (this is a DOM/Redux word game — the island board is a
 * <canvas>, so tile selection is deferred to PR-B; PR-A covers the DOM chrome:
 * load/start flow, controls, score/timer, and the leaderboard API contract).
 *
 * Adapted from the rogue-descent fleet config (testDir + build-then-serve +
 * chromium-only + non-blocking); the WebGL screenshot-baseline machinery is N/A here.
 */
const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["line"]] : "line",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build once, then serve the production bundle — deterministic + matches deploy.
  // The app has an API route, so it needs a running server (not a static export).
  webServer: {
    command: "pnpm build && pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
