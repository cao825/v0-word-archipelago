import gameReducer, { selectIsland, submitWord, resetSelection } from "../lib/slices/gameSlice"

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
  generateObjectives: jest.fn(() => []),
  checkObjectives: jest.fn(() => []),
}))

jest.mock("../lib/services/dictionaryService", () => ({
  validateWord: jest.fn((word) => {
    // Simple mock dictionary for testing
    const validWords = ["at", "ate", "tea"]
    return validWords.includes(word.toLowerCase())
  }),
}))

describe("Combo Reset Tests", () => {
  // Initial state for tests
  const initialState = gameReducer(undefined, { type: "unknown" })

  it("should reset combo count after an invalid word submission", () => {
    // Set up state with a combo count
    let state = {
      ...initialState,
      comboCount: 3,
      lastWordTime: Date.now(),
      gameActive: true,
    }

    // Select islands to form an invalid word
    state = gameReducer(state, selectIsland("island-0")) // 'A'
    state = gameReducer(state, selectIsland("island-2")) // 'E' (not directly connected)

    // This should fail because islands aren't connected
    state = gameReducer(state, resetSelection())

    // Try again with a valid path but invalid word
    state = gameReducer(state, selectIsland("island-0")) // 'A'
    state = gameReducer(state, selectIsland("island-1")) // 'T'
    state = gameReducer(state, selectIsland("island-2")) // 'E'

    // Modify the word to be invalid (not in our mock dictionary)
    const invalidWord = "xyz"

    // Mock the validateWord to return false for this specific test
    const mockValidateWord = require("../lib/services/dictionaryService").validateWord
    mockValidateWord.mockImplementationOnce(() => false)

    // Submit the invalid word
    state = gameReducer(state, submitWord())

    // Combo count should be reset to 0
    expect(state.comboCount).toBe(0)
    expect(state.invalidSubmission).toBe(true)
  })

  it("should maintain combo count for valid submissions within time window", () => {
    // Set up state with initial combo
    let state = {
      ...initialState,
      comboCount: 1,
      lastWordTime: Date.now(),
      gameActive: true,
    }

    // Submit a valid word
    state = gameReducer(state, selectIsland("island-0")) // 'A'
    state = gameReducer(state, selectIsland("island-1")) // 'T'
    state = gameReducer(state, submitWord()) // 'AT' is valid

    // Combo should increase to 2
    expect(state.comboCount).toBe(2)

    // Submit another valid word
    state = gameReducer(state, selectIsland("island-0")) // 'A'
    state = gameReducer(state, selectIsland("island-1")) // 'T'
    state = gameReducer(state, selectIsland("island-2")) // 'E'
    state = gameReducer(state, submitWord()) // 'ATE' is valid

    // Combo should increase to 3
    expect(state.comboCount).toBe(3)
  })
})
