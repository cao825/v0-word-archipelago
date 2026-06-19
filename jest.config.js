const nextJest = require("next/jest")

// Use next/jest so tests share the framework's SWC transform (handles TS/TSX and
// tsconfig `@/*` path aliases) instead of a separate ts-jest toolchain. No new
// transform dependency — `next` is already installed.
const createJestConfig = nextJest({ dir: "./" })

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: ["lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "!**/node_modules/**"],
}

module.exports = createJestConfig(customJestConfig)
