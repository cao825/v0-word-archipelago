import { generateObjectives, checkObjectives } from "../lib/utils/objectiveGenerator"
import type { Island, Objective } from "../lib/slices/gameSlice"

describe("Objective Generator", () => {
  // Mock islands for testing
  const mockIslands: Island[] = [
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
  ]

  // Mock seed function
  const mockSeed = jest.fn().mockReturnValue(0.5)

  describe("generateObjectives", () => {
    it("should generate 3 unique objectives", () => {
      const objectives = generateObjectives(mockSeed, mockIslands)

      expect(objectives.length).toBe(3)

      // Check for unique types
      const types = objectives.map((obj) => obj.type)
      const uniqueTypes = new Set(types)
      expect(uniqueTypes.size).toBe(3)
    })

    it("should generate objectives with correct structure", () => {
      const objectives = generateObjectives(mockSeed, mockIslands)

      objectives.forEach((objective) => {
        expect(objective).toHaveProperty("id")
        expect(objective).toHaveProperty("type")
        expect(objective).toHaveProperty("description")
        expect(objective).toHaveProperty("parameter")
        expect(objective).toHaveProperty("completed")
        expect(objective.completed).toBe(false)
      })
    })

    it("should use available letters for letter-based objectives", () => {
      // Force the seed to generate letter-based objectives
      const letterSeed = jest
        .fn()
        .mockReturnValueOnce(0.2) // For first objective type (startsWith)
        .mockReturnValueOnce(0.5) // For parameter selection
        .mockReturnValueOnce(0.4) // For second objective type (endsWith)
        .mockReturnValueOnce(0.5) // For parameter selection
        .mockReturnValueOnce(0.6) // For third objective type (contains)
        .mockReturnValueOnce(0.5) // For parameter selection

      const objectives = generateObjectives(letterSeed, mockIslands)

      // Check letter-based objectives use available letters
      objectives.forEach((objective) => {
        if (["startsWith", "endsWith", "contains"].includes(objective.type)) {
          const availableLetters = mockIslands.map((island) => island.letter)
          expect(availableLetters).toContain(objective.parameter)
        }
      })
    })
  })

  describe("checkObjectives", () => {
    // Sample objectives for testing
    const mockObjectives: Objective[] = [
      {
        id: "obj-length",
        type: "length",
        description: "Find a word with 3 letters",
        parameter: 3,
        completed: false,
      },
      {
        id: "obj-startsWith",
        type: "startsWith",
        description: "Find a word starting with A",
        parameter: "A",
        completed: false,
      },
      {
        id: "obj-endsWith",
        type: "endsWith",
        description: "Find a word ending with E",
        parameter: "E",
        completed: false,
      },
      {
        id: "obj-contains",
        type: "contains",
        description: "Find a word containing T",
        parameter: "T",
        completed: false,
      },
      {
        id: "obj-palindrome",
        type: "palindrome",
        description: "Find a palindrome",
        parameter: "palindrome",
        completed: false,
      },
    ]

    it("should identify completed length objectives", () => {
      const word = "CAT"
      const completedObjectives: string[] = []

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).toContain("obj-length")
    })

    it("should identify completed startsWith objectives", () => {
      const word = "ATE"
      const completedObjectives: string[] = []

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).toContain("obj-startsWith")
    })

    it("should identify completed endsWith objectives", () => {
      const word = "THE"
      const completedObjectives: string[] = []

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).toContain("obj-endsWith")
    })

    it("should identify completed contains objectives", () => {
      const word = "STAR"
      const completedObjectives: string[] = []

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).toContain("obj-contains")
    })

    it("should identify completed palindrome objectives", () => {
      const word = "LEVEL"
      const completedObjectives: string[] = []

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).toContain("obj-palindrome")
    })

    it("should not complete objectives that do not match", () => {
      const word = "DOG" // 3 letters but doesn't start with A, end with E, or contain T
      const completedObjectives: string[] = []

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).toContain("obj-length") // Should complete length objective
      expect(result).not.toContain("obj-startsWith")
      expect(result).not.toContain("obj-endsWith")
      expect(result).not.toContain("obj-contains")
    })

    it("should not return already completed objectives", () => {
      const word = "ATE" // Matches multiple objectives
      const completedObjectives = ["obj-length", "obj-startsWith"] // Already completed

      const result = checkObjectives(word, mockObjectives, completedObjectives)

      expect(result).not.toContain("obj-length")
      expect(result).not.toContain("obj-startsWith")
      expect(result).toContain("obj-endsWith") // Should still complete this one
      expect(result).toContain("obj-contains") // Should still complete this one
    })
  })
})
