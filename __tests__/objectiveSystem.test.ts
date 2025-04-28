import {
  hasAtLeastNVowels,
  checkWordAgainstObjective,
  checkObjectives,
  generateObjectives,
  type Objective,
  type ObjectiveType,
} from "../lib/utils/objectiveGenerator"

describe("Objective System", () => {
  describe("hasAtLeastNVowels", () => {
    test("correctly counts vowels", () => {
      expect(hasAtLeastNVowels("hello", 2)).toBe(true) // 2 vowels
      expect(hasAtLeastNVowels("world", 1)).toBe(true) // 1 vowel
      expect(hasAtLeastNVowels("sky", 1)).toBe(false) // 0 vowels
      expect(hasAtLeastNVowels("beautiful", 4)).toBe(true) // 5 vowels
      expect(hasAtLeastNVowels("toys", 1)).toBe(true) // 1 vowel (o)
      expect(hasAtLeastNVowels("toys", 2)).toBe(false) // only 1 vowel
      expect(hasAtLeastNVowels("aeiou", 5)).toBe(true) // 5 vowels
    })

    test("is case insensitive", () => {
      expect(hasAtLeastNVowels("HELLO", 2)).toBe(true)
      expect(hasAtLeastNVowels("World", 1)).toBe(true)
      expect(hasAtLeastNVowels("TOYS", 1)).toBe(true)
      expect(hasAtLeastNVowels("AEIOU", 5)).toBe(true)
    })

    test("handles edge cases", () => {
      expect(hasAtLeastNVowels("", 1)).toBe(false)
      expect(hasAtLeastNVowels(null as any, 1)).toBe(false)
      expect(hasAtLeastNVowels(undefined as any, 1)).toBe(false)
      expect(hasAtLeastNVowels("hello", 0)).toBe(true) // Any word has at least 0 vowels
    })
  })

  describe("checkWordAgainstObjective", () => {
    const createObjective = (type: ObjectiveType, parameter: string | number): Objective => ({
      id: `${type}-${parameter}`,
      type,
      description: `Test ${type} objective`,
      parameter,
      completed: false,
    })

    describe("length objective", () => {
      test("matches words of exact length", () => {
        const objective3 = createObjective("length", 3)
        const objective4 = createObjective("length", 4)
        const objective6 = createObjective("length", 6)

        // 3-letter words
        expect(checkWordAgainstObjective("cat", objective3)).toBe(true)
        expect(checkWordAgainstObjective("dog", objective3)).toBe(true)
        expect(checkWordAgainstObjective("ton", objective3)).toBe(true)

        // 4-letter words
        expect(checkWordAgainstObjective("test", objective4)).toBe(true)
        expect(checkWordAgainstObjective("word", objective4)).toBe(true)
        expect(checkWordAgainstObjective("toys", objective4)).toBe(true)

        // 6-letter words
        expect(checkWordAgainstObjective("garden", objective6)).toBe(true)
        expect(checkWordAgainstObjective("system", objective6)).toBe(true)
      })

      test("rejects words of different length", () => {
        const objective3 = createObjective("length", 3)
        const objective4 = createObjective("length", 4)

        // 3-letter words should NOT match 4-letter objective
        expect(checkWordAgainstObjective("cat", objective4)).toBe(false)
        expect(checkWordAgainstObjective("dog", objective4)).toBe(false)
        expect(checkWordAgainstObjective("ton", objective4)).toBe(false)

        // 4-letter words should NOT match 3-letter objective
        expect(checkWordAgainstObjective("test", objective3)).toBe(false)
        expect(checkWordAgainstObjective("word", objective3)).toBe(false)
        expect(checkWordAgainstObjective("toys", objective3)).toBe(false)
      })

      test("handles string parameters", () => {
        const objective = createObjective("length", "3")

        expect(checkWordAgainstObjective("cat", objective)).toBe(true)
        expect(checkWordAgainstObjective("dog", objective)).toBe(true)
        expect(checkWordAgainstObjective("test", objective)).toBe(false)
        expect(checkWordAgainstObjective("toys", objective)).toBe(false)
      })

      test("handles invalid parameters", () => {
        const invalidObjective = createObjective("length", "not-a-number")

        expect(checkWordAgainstObjective("test", invalidObjective)).toBe(false)
        expect(checkWordAgainstObjective("toys", invalidObjective)).toBe(false)
      })
    })

    describe("startsWith objective", () => {
      test("matches words starting with the parameter", () => {
        const objectiveT = createObjective("startsWith", "t")
        const objectiveS = createObjective("startsWith", "s")

        // Words starting with 't'
        expect(checkWordAgainstObjective("test", objectiveT)).toBe(true)
        expect(checkWordAgainstObjective("ton", objectiveT)).toBe(true)
        expect(checkWordAgainstObjective("toys", objectiveT)).toBe(true)

        // Words starting with 's'
        expect(checkWordAgainstObjective("system", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("sun", objectiveS)).toBe(true)
      })

      test("rejects words not starting with the parameter", () => {
        const objectiveT = createObjective("startsWith", "t")

        expect(checkWordAgainstObjective("cat", objectiveT)).toBe(false)
        expect(checkWordAgainstObjective("dog", objectiveT)).toBe(false)
        expect(checkWordAgainstObjective("system", objectiveT)).toBe(false)
      })

      test("is case insensitive", () => {
        const objectiveT = createObjective("startsWith", "T") // Uppercase parameter

        expect(checkWordAgainstObjective("test", objectiveT)).toBe(true)
        expect(checkWordAgainstObjective("Ton", objectiveT)).toBe(true) // Uppercase first letter
        expect(checkWordAgainstObjective("TOYS", objectiveT)).toBe(true) // All uppercase
      })

      test("handles invalid parameters", () => {
        const invalidObjective = createObjective("startsWith", 123)

        expect(checkWordAgainstObjective("test", invalidObjective)).toBe(false)
      })
    })

    describe("endsWith objective", () => {
      test("matches words ending with the parameter", () => {
        const objectiveN = createObjective("endsWith", "n")
        const objectiveS = createObjective("endsWith", "s")
        const objectiveH = createObjective("endsWith", "h")

        // Words ending with 'n'
        expect(checkWordAgainstObjective("ton", objectiveN)).toBe(true)
        expect(checkWordAgainstObjective("run", objectiveN)).toBe(true)

        // Words ending with 's'
        expect(checkWordAgainstObjective("toys", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("cats", objectiveS)).toBe(true)

        // Words ending with 'h'
        expect(checkWordAgainstObjective("fish", objectiveH)).toBe(true)
        expect(checkWordAgainstObjective("dish", objectiveH)).toBe(true)
      })

      test("rejects words not ending with the parameter", () => {
        const objectiveN = createObjective("endsWith", "n")
        const objectiveH = createObjective("endsWith", "h")

        expect(checkWordAgainstObjective("cat", objectiveN)).toBe(false)
        expect(checkWordAgainstObjective("toys", objectiveN)).toBe(false)
        expect(checkWordAgainstObjective("toys", objectiveH)).toBe(false) // "toys" does NOT end with "h"
      })

      test("is case insensitive", () => {
        const objectiveS = createObjective("endsWith", "S") // Uppercase parameter

        expect(checkWordAgainstObjective("toys", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("Toys", objectiveS)).toBe(true) // Mixed case
        expect(checkWordAgainstObjective("TOYS", objectiveS)).toBe(true) // All uppercase
      })

      test("handles invalid parameters", () => {
        const invalidObjective = createObjective("endsWith", 123)

        expect(checkWordAgainstObjective("test", invalidObjective)).toBe(false)
      })
    })

    describe("contains objective", () => {
      test("matches words containing the parameter", () => {
        const objectiveO = createObjective("contains", "o")
        const objectiveY = createObjective("contains", "y")

        // Words containing 'o'
        expect(checkWordAgainstObjective("ton", objectiveO)).toBe(true)
        expect(checkWordAgainstObjective("dog", objectiveO)).toBe(true)
        expect(checkWordAgainstObjective("toys", objectiveO)).toBe(true)

        // Words containing 'y'
        expect(checkWordAgainstObjective("toys", objectiveY)).toBe(true)
        expect(checkWordAgainstObjective("system", objectiveY)).toBe(true)
      })

      test("rejects words not containing the parameter", () => {
        const objectiveZ = createObjective("contains", "z")

        expect(checkWordAgainstObjective("cat", objectiveZ)).toBe(false)
        expect(checkWordAgainstObjective("dog", objectiveZ)).toBe(false)
        expect(checkWordAgainstObjective("toys", objectiveZ)).toBe(false)
      })

      test("is case insensitive", () => {
        const objectiveO = createObjective("contains", "O") // Uppercase parameter

        expect(checkWordAgainstObjective("ton", objectiveO)).toBe(true)
        expect(checkWordAgainstObjective("dOg", objectiveO)).toBe(true) // Mixed case
        expect(checkWordAgainstObjective("TOYS", objectiveO)).toBe(true) // All uppercase
      })

      test("handles invalid parameters", () => {
        const invalidObjective = createObjective("contains", 123)

        expect(checkWordAgainstObjective("test", invalidObjective)).toBe(false)
      })
    })
  })

  describe("checkObjectives", () => {
    test("identifies completed objectives correctly", () => {
      const objectives: Objective[] = [
        {
          id: "length-3",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "startsWith-t",
          type: "startsWith",
          description: "Find a word starting with 't'",
          parameter: "t",
          completed: false,
        },
        {
          id: "endsWith-s",
          type: "endsWith",
          description: "Find a word ending with 's'",
          parameter: "s",
          completed: false,
        },
      ]

      // Test with "ton" - should complete length-3 and startsWith-t
      const completedWithTon = checkObjectives("ton", objectives, [])
      expect(completedWithTon).toContain("length-3")
      expect(completedWithTon).toContain("startsWith-t")
      expect(completedWithTon).not.toContain("endsWith-s")
      expect(completedWithTon.length).toBe(2)

      // Test with "toys" - should complete startsWith-t and endsWith-s
      const completedWithToys = checkObjectives("toys", objectives, [])
      expect(completedWithToys).not.toContain("length-3")
      expect(completedWithToys).toContain("startsWith-t")
      expect(completedWithToys).toContain("endsWith-s")
      expect(completedWithToys.length).toBe(2)
    })

    test("skips already completed objectives", () => {
      const objectives: Objective[] = [
        {
          id: "length-3",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "startsWith-t",
          type: "startsWith",
          description: "Find a word starting with 't'",
          parameter: "t",
          completed: false,
        },
        {
          id: "endsWith-s",
          type: "endsWith",
          description: "Find a word ending with 's'",
          parameter: "s",
          completed: false,
        },
      ]

      // Mark length-3 and endsWith-s as already completed
      const alreadyCompleted = ["length-3", "endsWith-s"]

      // Test with "toys" - should only complete startsWith-t
      const completed = checkObjectives("toys", objectives, alreadyCompleted)
      expect(completed).not.toContain("length-3")
      expect(completed).toContain("startsWith-t")
      expect(completed).not.toContain("endsWith-s")
      expect(completed.length).toBe(1)
    })

    test("handles empty or invalid inputs", () => {
      const objectives: Objective[] = [
        {
          id: "length-3",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
      ]

      expect(checkObjectives("", objectives, [])).toEqual([])
      expect(checkObjectives("a", objectives, [])).toEqual([])
      expect(checkObjectives(null as any, objectives, [])).toEqual([])
      expect(checkObjectives(undefined as any, objectives, [])).toEqual([])
    })

    test("handles empty objectives array", () => {
      expect(checkObjectives("test", [], [])).toEqual([])
    })
  })

  describe("generateObjectives", () => {
    const createMockIslands = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        letter: String.fromCharCode(65 + i), // A, B, C, ...
        position: { x: 0, y: 0 },
        size: 40,
        connections: [],
      }))
    }

    test("generates the correct number of objectives", () => {
      const mockIslands = createMockIslands(6)
      const mockSeed = jest.fn().mockReturnValue(0.5)
      const objectives = generateObjectives(mockSeed, mockIslands)

      expect(objectives.length).toBe(3)
    })

    test("handles invalid islands gracefully", () => {
      const mockSeed = jest.fn().mockReturnValue(0.5)

      // Test with null
      expect(generateObjectives(mockSeed, null as any)).toEqual([])

      // Test with empty array
      expect(generateObjectives(mockSeed, [])).toHaveLength(3)

      // Test with invalid islands
      const invalidIslands = [{ invalid: "data" }] as any
      const objectives = generateObjectives(mockSeed, invalidIslands)
      expect(objectives.length).toBe(3)
    })

    test("generates unique objectives", () => {
      const mockIslands = createMockIslands(6)
      let counter = 0
      const mockSeed = jest.fn().mockImplementation(() => {
        counter += 1
        return 0.1 // Always return the same value to try to force duplicates
      })

      const objectives = generateObjectives(mockSeed, mockIslands)

      // Check that all objectives have unique types
      const types = objectives.map((obj) => obj.type)
      const uniqueTypes = new Set(types)

      // We should have 3 unique objective types
      expect(uniqueTypes.size).toBe(objectives.length)
    })
  })
})
