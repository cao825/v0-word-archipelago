import {
  getLeaderboardEntries,
  formatInitials,
  addLeaderboardEntry,
  getHourlyLeaderboard,
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  formatTimestamp,
  type LeaderboardEntry,
} from "../lib/utils/leaderboardUtils"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    getAllKeys: () => Object.keys(store),
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

describe("Leaderboard Utils", () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    // jsdom does not provide fetch. addLeaderboardEntry/getLeaderboardEntries
    // call it; without this, fetch() throws synchronously and the function
    // reports failure. A rejecting mock mirrors "API unavailable" — the code
    // still writes locally and returns success, and the rejection is caught.
    global.fetch = jest.fn().mockRejectedValue(new Error("no network (test)")) as unknown as typeof fetch
  })

  afterEach(() => {
    // Safety net: ensure no test leaves fake timers enabled for the next one.
    jest.useRealTimers()
  })

  describe("getLeaderboardEntries", () => {
    it("should return an empty array if no entries exist", () => {
      const entries = getLeaderboardEntries()

      // There is no client-side seeding: with empty storage and no API data,
      // the function returns an empty array (data comes from localStorage/API).
      expect(entries).toEqual([])
    })

    it("should return entries from localStorage if they exist", () => {
      const mockEntries: LeaderboardEntry[] = [
        {
          playerInitials: "ABC",
          score: 100,
          timestamp: Date.now(),
          objectivesCompleted: 2,
          wordsFound: 10,
        },
      ]

      localStorageMock.setItem("wordArchipelago_leaderboard", JSON.stringify(mockEntries))

      const entries = getLeaderboardEntries()

      expect(entries).toEqual(mockEntries)
      expect(localStorageMock.getItem).toHaveBeenCalledWith("wordArchipelago_leaderboard")
    })

    it("should validate and fix corrupted entries", () => {
      const corruptedEntries = [
        {
          playerInitials: "ABC",
          score: 100,
          timestamp: Date.now(),
          objectivesCompleted: 5, // More than max 3
          wordsFound: 10,
        },
      ]

      localStorageMock.setItem("wordArchipelago_leaderboard", JSON.stringify(corruptedEntries))

      const entries = getLeaderboardEntries()

      // Should have fixed the objectivesCompleted value
      expect(entries[0].objectivesCompleted).toBe(3)
    })
  })

  describe("formatInitials", () => {
    it("should format initials correctly", () => {
      expect(formatInitials("abc")).toBe("ABC")
      expect(formatInitials("a")).toBe("AAA")
      expect(formatInitials("abcdef")).toBe("ABC")
      expect(formatInitials("")).toBe("AAA")
      expect(formatInitials("a1b2c3")).toBe("ABC")
    })
  })

  describe("addLeaderboardEntry", () => {
    it("should add a valid entry to the leaderboard", () => {
      const entry: LeaderboardEntry = {
        playerInitials: "ABC",
        score: 100,
        timestamp: Date.now(),
        objectivesCompleted: 2,
        wordsFound: 10,
      }

      const result = addLeaderboardEntry(entry)

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalled()

      // Check that the entry was added
      const entries = getLeaderboardEntries()
      expect(entries).toContainEqual(
        expect.objectContaining({
          playerInitials: "ABC",
          score: 100,
        }),
      )
    })

    it("should reject invalid entries", () => {
      const invalidEntry = {
        playerInitials: "ABC",
        score: -100, // Invalid score
        timestamp: Date.now(),
        objectivesCompleted: 2,
        wordsFound: 10,
      } as LeaderboardEntry

      const result = addLeaderboardEntry(invalidEntry)

      expect(result).toBe(false)
    })

    it("should enforce rate limiting", () => {
      // Set last submission time to now
      localStorageMock.setItem("wordArchipelago_lastSubmission", Date.now().toString())

      const entry: LeaderboardEntry = {
        playerInitials: "ABC",
        score: 100,
        timestamp: Date.now(),
        objectivesCompleted: 2,
        wordsFound: 10,
      }

      const result = addLeaderboardEntry(entry)

      // Should be rejected due to rate limiting
      expect(result).toBe(false)
    })

    it("should limit objectives to maximum of 3", () => {
      const entry: LeaderboardEntry = {
        playerInitials: "ABC",
        score: 100,
        timestamp: Date.now(),
        objectivesCompleted: 5, // More than max
        wordsFound: 10,
      }

      addLeaderboardEntry(entry)

      const entries = getLeaderboardEntries()
      const addedEntry = entries.find((e) => e.playerInitials === "ABC" && e.score === 100)

      expect(addedEntry?.objectivesCompleted).toBe(3)
    })
  })

  describe("getHourlyLeaderboard", () => {
    it("should return entries from the current hour", () => {
      // Pin the clock to a fixed mid-hour instant. Without this the test is
      // flaky: in the first 10 minutes of any real hour the "10 minutes ago"
      // entry falls into the PREVIOUS hour and is excluded, flipping the count.
      jest.useFakeTimers()
      jest.setSystemTime(new Date("2024-01-01T10:30:00Z"))

      const now = Date.now()
      const hourAgo = now - 60 * 60 * 1000

      const entries: LeaderboardEntry[] = [
        {
          playerInitials: "ABC",
          score: 100,
          timestamp: now - 10 * 60 * 1000, // 10 minutes ago
          objectivesCompleted: 2,
          wordsFound: 10,
        },
        {
          playerInitials: "DEF",
          score: 200,
          timestamp: hourAgo - 1000, // Just over an hour ago
          objectivesCompleted: 3,
          wordsFound: 15,
        },
      ]

      localStorageMock.setItem("wordArchipelago_leaderboard", JSON.stringify(entries))

      const hourlyEntries = getHourlyLeaderboard()

      expect(hourlyEntries.length).toBe(1)
      expect(hourlyEntries[0].playerInitials).toBe("ABC")
    })
  })

  describe("getDailyLeaderboard", () => {
    it("should return entries from the last 24 hours", () => {
      const now = Date.now()
      const dayAgo = now - 24 * 60 * 60 * 1000

      const entries: LeaderboardEntry[] = [
        {
          playerInitials: "ABC",
          score: 100,
          timestamp: now - 10 * 60 * 1000, // 10 minutes ago
          objectivesCompleted: 2,
          wordsFound: 10,
        },
        {
          playerInitials: "DEF",
          score: 200,
          timestamp: dayAgo - 1000, // Just over a day ago
          objectivesCompleted: 3,
          wordsFound: 15,
        },
      ]

      localStorageMock.setItem("wordArchipelago_leaderboard", JSON.stringify(entries))

      const dailyEntries = getDailyLeaderboard()

      expect(dailyEntries.length).toBe(1)
      expect(dailyEntries[0].playerInitials).toBe("ABC")
    })
  })

  describe("getAllTimeLeaderboard", () => {
    it("should return all entries sorted by score", () => {
      const entries: LeaderboardEntry[] = [
        {
          playerInitials: "ABC",
          score: 100,
          timestamp: Date.now(),
          objectivesCompleted: 2,
          wordsFound: 10,
        },
        {
          playerInitials: "DEF",
          score: 200,
          timestamp: Date.now(),
          objectivesCompleted: 3,
          wordsFound: 15,
        },
        {
          playerInitials: "GHI",
          score: 150,
          timestamp: Date.now(),
          objectivesCompleted: 1,
          wordsFound: 12,
        },
      ]

      localStorageMock.setItem("wordArchipelago_leaderboard", JSON.stringify(entries))

      const allTimeEntries = getAllTimeLeaderboard()

      expect(allTimeEntries.length).toBe(3)
      expect(allTimeEntries[0].playerInitials).toBe("DEF") // Highest score
      expect(allTimeEntries[1].playerInitials).toBe("GHI") // Second highest
      expect(allTimeEntries[2].playerInitials).toBe("ABC") // Lowest score
    })
  })

  describe("formatTimestamp", () => {
    it("should format timestamp correctly", () => {
      // Create a date with a known time
      const date = new Date()
      date.setHours(14, 30, 0, 0) // 2:30 PM

      const timestamp = date.getTime()
      const formatted = formatTimestamp(timestamp)

      // This test is a bit tricky because the exact format depends on the locale
      // Just check that it contains numbers and a colon
      expect(formatted).toMatch(/\d+:\d+/)
    })

    it("should handle invalid timestamps gracefully", () => {
      const formatted = formatTimestamp(Number.NaN)
      expect(formatted).toBe("Unknown time")
    })
  })
})
