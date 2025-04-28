import gameReducer, {
  selectIsland,
  submitWord,
  resetSelection,
  tickTimer,
  startGame,
  resetGame,
  setGameTheme,
  hidePointsAnimation,
} from "../lib/slices/gameSlice"

// Mock the dependencies
jest.mock("../lib/utils/islandGenerator", () => ({
  generateIslands: jest.fn(() => [
    {
      id: "island-0",
      letter: "A",
      position: { x: 100, y: 100 },
      size: 40,
      connections: ["island-1"],
    },
    {
      id: "island-1",
      letter: "T",
      position: { x: 200, y: 200 },
      size: 40,
      connections: ["island-0", "island-2"],
    },
    {
      id: "island-2",
      letter: "E",
      position: { x: 300, y: 300 },
      size: 40,
      connections: ["island-1"],
    },
  ]),
}))

jest.mock("../lib/utils/objectiveGenerator", () => ({
  generateObjectives: jest.fn(() => [
    {
      id: "objective-0",
      type: "length",
      description: "Find a word with 3 letters",
      parameter: 3,
      completed: false,
    },
  ]),
  checkObjectives: jest.fn((word, objectives, completedObjectives) => {
    if (word === "ate" && objectives[0].type === "length" && objectives[0].parameter === 3) {
      return ["objective-0"]
    }
    return []
  }),
}))

jest.mock("../lib/services/dictionaryService", () => ({
  validateWord: jest.fn((word) => {
    // Simple mock dictionary for testing
    const validWords = ["at", "ate", "tea"]
    return validWords.includes(word.toLowerCase())
  }),
}))

describe("Game Slice", () => {
  // Initial state for tests
  const initialState = gameReducer(undefined, { type: "unknown" })

  describe("selectIsland", () => {
    it("should add the first island to selection", () => {
      const state = gameReducer(initialState, selectIsland("island-0"))
      expect(state.selectedIslands).toEqual(["island-0"])
    })

    it("should add a connected island to selection", () => {
      let state = gameReducer(initialState, selectIsland("island-0"))
      state = gameReducer(state, selectIsland("island-1"))
      expect(state.selectedIslands).toEqual(["island-0", "island-1"])
    })

    it("should not add an unconnected island to selection", () => {
      let state = gameReducer(initialState, selectIsland("island-0"))
      state = gameReducer(state, selectIsland("island-2")) // Not directly connected to island-0
      expect(state.selectedIslands).toEqual(["island-0"])
      expect(state.message).toContain("Islands must be connected")
    })

    it("should allow backtracking by one step", () => {
      let state = gameReducer(initialState, selectIsland("island-0"))
      state = gameReducer(state, selectIsland("island-1"))
      state = gameReducer(state, selectIsland("island-0")) // Backtrack
      expect(state.selectedIslands).toEqual(["island-0"])
    })

    it("should not add the same island twice", () => {
      let state = gameReducer(initialState, selectIsland("island-0"))
      state = gameReducer(state, selectIsland("island-0")) // Same island again
      expect(state.selectedIslands).toEqual(["island-0"])
    })
  })

  describe("submitWord", () => {
    it("should reject words less than 2 letters", () => {
      let state = gameReducer(initialState, selectIsland("island-0")) // Just 'A'
      state = gameReducer(state, submitWord())
      expect(state.invalidSubmission).toBe(true)
      expect(state.message).toContain("at least 2 letters")
      expect(state.selectedIslands).toEqual([])
    })

    it("should accept valid words and add to found words", () => {
      // Set up state with 'A' and 'T' selected
      let state = gameReducer(initialState, selectIsland("island-0")) // 'A'
      state = gameReducer(state, selectIsland("island-1")) // 'T'
      state = gameReducer(state, submitWord()) // 'AT' is valid

      expect(state.invalidSubmission).toBe(false)
      expect(state.successfulSubmission).toBe(true)
      expect(state.foundWords).toContain("at")
      expect(state.score).toBe(20) // 2 letters * 10 points
      expect(state.selectedIslands).toEqual([])
    })

    it("should reject invalid words", () => {
      // Create a word that's not in our mock dictionary
      let state = {
        ...initialState,
        islands: [
          ...initialState.islands,
          {
            id: "island-3",
            letter: "X",
            position: { x: 400, y: 400 },
            size: 40,
            connections: ["island-2"],
          },
        ],
      }

      state = gameReducer(state, selectIsland("island-2")) // 'E'
      state = gameReducer(state, selectIsland("island-3")) // 'X'
      state = gameReducer(state, submitWord()) // 'EX' is not valid

      expect(state.invalidSubmission).toBe(true)
      expect(state.successfulSubmission).toBe(false)
      expect(state.foundWords).not.toContain("ex")
      expect(state.selectedIslands).toEqual([])
    })

    it("should not allow submitting the same word twice", () => {
      // First submit 'AT'
      let state = gameReducer(initialState, selectIsland("island-0")) // 'A'
      state = gameReducer(state, selectIsland("island-1")) // 'T'
      state = gameReducer(state, submitWord()) // 'AT' is valid

      // Try to submit 'AT' again
      state = gameReducer(state, selectIsland("island-0")) // 'A'
      state = gameReducer(state, selectIsland("island-1")) // 'T'
      state = gameReducer(state, submitWord()) // 'AT' again

      expect(state.invalidSubmission).toBe(true)
      expect(state.message).toContain("already found")
    })

    it("should complete objectives when conditions are met", () => {
      // Submit 'ATE' which should complete the 3-letter word objective
      let state = gameReducer(initialState, selectIsland("island-0")) // 'A'
      state = gameReducer(state, selectIsland("island-1")) // 'T'
      state = gameReducer(state, selectIsland("island-2")) // 'E'
      state = gameReducer(state, submitWord()) // 'ATE' is valid and 3 letters

      expect(state.completedObjectives).toContain("objective-0")
      expect(state.score).toBe(80) // 30 for word + 50 for objective
      expect(state.objectives[0].completed).toBe(true)
    })
  })

  describe("resetSelection", () => {
    it("should clear selected islands", () => {
      let state = gameReducer(initialState, selectIsland("island-0"))
      state = gameReducer(state, selectIsland("island-1"))
      state = gameReducer(state, resetSelection())
      expect(state.selectedIslands).toEqual([])
    })
  })

  describe("tickTimer", () => {
    it("should decrement time when game is active", () => {
      let state = { ...initialState, gameActive: true, timeLeft: 120 }
      state = gameReducer(state, tickTimer())
      expect(state.timeLeft).toBe(119)
    })

    it("should end the game when time reaches zero", () => {
      let state = { ...initialState, gameActive: true, timeLeft: 1 }
      state = gameReducer(state, tickTimer())
      expect(state.timeLeft).toBe(0)
      expect(state.gameActive).toBe(false)
      expect(state.message).toContain("Time's up")
    })

    it("should not decrement time when game is not active", () => {
      let state = { ...initialState, gameActive: false, timeLeft: 120 }
      state = gameReducer(state, tickTimer())
      expect(state.timeLeft).toBe(120)
    })
  })

  describe("startGame", () => {
    it("should initialize a new game", () => {
      const state = gameReducer(initialState, startGame())
      expect(state.gameActive).toBe(true)
      expect(state.timeLeft).toBe(120)
      expect(state.score).toBe(0)
      expect(state.foundWords).toEqual([])
      expect(state.selectedIslands).toEqual([])
      expect(state.completedObjectives).toEqual([])
    })
  })

  describe("resetGame", () => {
    it("should reset the game state but keep islands", () => {
      // First set up a game with some progress
      let state = gameReducer(initialState, startGame())
      state = gameReducer(state, selectIsland("island-0"))
      state = gameReducer(state, selectIsland("island-1"))
      state = gameReducer(state, submitWord()) // Add a word

      // Now reset
      state = gameReducer(state, resetGame())

      expect(state.gameActive).toBe(false)
      expect(state.timeLeft).toBe(120)
      expect(state.score).toBe(0)
      expect(state.foundWords).toEqual([])
      expect(state.selectedIslands).toEqual([])
      expect(state.completedObjectives).toEqual([])

      // Islands should still be there
      expect(state.islands.length).toBeGreaterThan(0)
    })
  })

  describe("setGameTheme", () => {
    it("should update the game theme", () => {
      let state = gameReducer(initialState, setGameTheme("sunset"))
      expect(state.theme).toBe("sunset")

      state = gameReducer(state, setGameTheme("stormy"))
      expect(state.theme).toBe("stormy")
    })
  })

  describe("hidePointsAnimation", () => {
    it("should hide the points animation", () => {
      let state = {
        ...initialState,
        pointsAnimation: { points: 30, isVisible: true },
      }
      state = gameReducer(state, hidePointsAnimation())
      expect(state.pointsAnimation.isVisible).toBe(false)
      expect(state.pointsAnimation.points).toBe(30) // Points value should remain
    })
  })
})
