import { generateObjectives, checkObjectives } from "../lib/utils/objectiveGenerator"
import type { Objective, Island } from "../lib/slices/gameSlice"

describe("Objective System", () => {
  // Mock islands for testing
  const mockIslands: Island[] = [
    { id: "island-0", letter: "T", position: { x: 100, y: 100 }, size: 40, connections: ["island-1"] },
    { id: "island-1", letter: "O", position: { x: 200, y: 200 }, size: 40, connections: ["island-0", "island-2"] },
    { id: "island-2", letter: "N", position: { x: 300, y: 300 }, size: 40, connections: ["island-1", "island-3"] },
    { id: "island-3", letter: "E", position: { x: 400, y: 400 }, size: 40, connections: ["island-2"] },
    { id: "island-4", letter: "S", position: { x: 500, y: 500 }, size: 40, connections: [] },
  ]

  // Mock seed function
  const mockSeed = jest.fn().mockReturnValue(0.5)

  describe("generateObjectives", () => {
    it("should generate 3 unique objectives", () => {
      const objectives = generateObjectives(mockSeed, mockIslands)
      expect(objectives.length).toBe(3)

      // Check for unique IDs
      const ids = objectives.map((obj) => obj.id)
      expect(new Set(ids).size).toBe(3)

      // Check for unique types or parameters
      const typeParams = objectives.map((obj) => `${obj.type}-${obj.parameter}`)
      expect(new Set(typeParams).size).toBe(3)
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
  })

  describe("checkObjectives", () => {
    // Test each objective type individually
    describe("length objective", () => {
      it("should complete when word length matches parameter", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "length",
            description: "Find a word with 3 letters",
            parameter: 3,
            completed: false,
          },
        ]

        // Should complete
        expect(checkObjectives("cat", objectives, [])).toEqual(["obj-1"])

        // Should not complete
        expect(checkObjectives("cats", objectives, [])).toEqual([])
        expect(checkObjectives("to", objectives, [])).toEqual([])
      })

      it("should not complete for the word 'ton' if parameter is not 3", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "length",
            description: "Find a word with 4 letters",
            parameter: 4,
            completed: false,
          },
        ]

        // "ton" is 3 letters, should not complete a 4-letter objective
        expect(checkObjectives("ton", objectives, [])).toEqual([])
      })
    })

    describe("startsWith objective", () => {
      it("should complete when word starts with parameter", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "startsWith",
            description: "Find a word starting with 't'",
            parameter: "t",
            completed: false,
          },
        ]

        // Should complete
        expect(checkObjectives("ton", objectives, [])).toEqual(["obj-1"])
        expect(checkObjectives("test", objectives, [])).toEqual(["obj-1"])

        // Should not complete
        expect(checkObjectives("cat", objectives, [])).toEqual([])
      })

      it("should be case insensitive", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "startsWith",
            description: "Find a word starting with 'T'",
            parameter: "T",
            completed: false,
          },
        ]

        expect(checkObjectives("ton", objectives, [])).toEqual(["obj-1"])
        expect(checkObjectives("TON", objectives, [])).toEqual(["obj-1"])
      })
    })

    describe("endsWith objective", () => {
      it("should complete when word ends with parameter", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "endsWith",
            description: "Find a word ending with 'n'",
            parameter: "n",
            completed: false,
          },
        ]

        // Should complete
        expect(checkObjectives("ton", objectives, [])).toEqual(["obj-1"])
        expect(checkObjectives("rain", objectives, [])).toEqual(["obj-1"])

        // Should not complete
        expect(checkObjectives("cat", objectives, [])).toEqual([])
      })
    })

    describe("contains objective", () => {
      it("should complete when word contains parameter", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "contains",
            description: "Find a word containing 'o'",
            parameter: "o",
            completed: false,
          },
        ]

        // Should complete
        expect(checkObjectives("ton", objectives, [])).toEqual(["obj-1"])
        expect(checkObjectives("dog", objectives, [])).toEqual(["obj-1"])

        // Should not complete
        expect(checkObjectives("cat", objectives, [])).toEqual([])
      })
    })

    describe("palindrome objective", () => {
      it("should complete when word is a palindrome", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "palindrome",
            description: "Find a palindrome",
            parameter: "palindrome",
            completed: false,
          },
        ]

        // Should complete
        expect(checkObjectives("mom", objectives, [])).toEqual(["obj-1"])
        expect(checkObjectives("level", objectives, [])).toEqual(["obj-1"])

        // Should not complete
        expect(checkObjectives("ton", objectives, [])).toEqual([])
        expect(checkObjectives("cat", objectives, [])).toEqual([])
      })

      it("should require at least 3 letters for palindromes", () => {
        const objectives: Objective[] = [
          {
            id: "obj-1",
            type: "palindrome",
            description: "Find a palindrome",
            parameter: "palindrome",
            completed: false,
          },
        ]

        // "aa" is technically a palindrome but too short
        expect(checkObjectives("aa", objectives, [])).toEqual([])
      })
    })

    // Test multiple objectives at once
    it("should handle multiple objectives correctly", () => {
      const objectives: Objective[] = [
        {
          id: "obj-1",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "obj-2",
          type: "startsWith",
          description: "Find a word starting with 't'",
          parameter: "t",
          completed: false,
        },
        {
          id: "obj-3",
          type: "contains",
          description: "Find a word containing 'a'",
          parameter: "a",
          completed: false,
        },
      ]

      // Should complete two objectives
      expect(checkObjectives("ton", objectives, [])).toEqual(["obj-1", "obj-2"])

      // Should complete one objective
      expect(checkObjectives("cat", objectives, [])).toEqual(["obj-1", "obj-3"])

      // Should complete no objectives
      expect(checkObjectives("dogs", objectives, [])).toEqual([])
    })

    // Test already completed objectives
    it("should not return already completed objectives", () => {
      const objectives: Objective[] = [
        {
          id: "obj-1",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: true, // Already marked as completed
        },
        {
          id: "obj-2",
          type: "startsWith",
          description: "Find a word starting with 't'",
          parameter: "t",
          completed: false,
        },
      ]

      // Should only return obj-2
      expect(checkObjectives("ton", objectives, [])).toEqual(["obj-2"])

      // Using completedObjectives array
      const objectives2: Objective[] = [
        {
          id: "obj-1",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "obj-2",
          type: "startsWith",
          description: "Find a word starting with 't'",
          parameter: "t",
          completed: false,
        },
      ]

      // Should only return obj-2
      expect(checkObjectives("ton", objectives2, ["obj-1"])).toEqual(["obj-2"])
    })

    // Test edge cases
    it("should handle edge cases gracefully", () => {
      const objectives: Objective[] = [
        {
          id: "obj-1",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
      ]

      // Empty word
      expect(checkObjectives("", objectives, [])).toEqual([])

      // Single letter
      expect(checkObjectives("a", objectives, [])).toEqual([])

      // Null/undefined
      expect(checkObjectives(null as any, objectives, [])).toEqual([])
      expect(checkObjectives(undefined as any, objectives, [])).toEqual([])

      // Non-string
      expect(checkObjectives(123 as any, objectives, [])).toEqual([])
    })

    // Test invalid objective types
    it("should handle invalid objective types", () => {
      const objectives: Objective[] = [
        {
          id: "obj-1",
          type: "invalidType" as any,
          description: "Invalid objective",
          parameter: "x",
          completed: false,
        },
      ]

      // Should not error, just return empty array
      expect(checkObjectives("test", objectives, [])).toEqual([])
    })
  })

  // Test specific issue with "ton" word
  describe("specific issue with 'ton' word", () => {
    it("should only complete objectives that actually match 'ton'", () => {
      const objectives: Objective[] = [
        {
          id: "obj-1",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "obj-2",
          type: "startsWith",
          description: "Find a word starting with 't'",
          parameter: "t",
          completed: false,
        },
        {
          id: "obj-3",
          type: "endsWith",
          description: "Find a word ending with 'n'",
          parameter: "n",
          completed: false,
        },
        {
          id: "obj-4",
          type: "contains",
          description: "Find a word containing 'o'",
          parameter: "o",
          completed: false,
        },
        {
          id: "obj-5",
          type: "palindrome",
          description: "Find a palindrome",
          parameter: "palindrome",
          completed: false,
        },
      ]

      // Should complete these specific objectives
      const completed = checkObjectives("ton", objectives, [])
      expect(completed).toContain("obj-1") // 3 letters
      expect(completed).toContain("obj-2") // starts with t
      expect(completed).toContain("obj-3") // ends with n
      expect(completed).toContain("obj-4") // contains o
      expect(completed).not.toContain("obj-5") // not a palindrome
      expect(completed.length).toBe(4)
    })
  })
})
