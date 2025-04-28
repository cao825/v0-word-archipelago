import {
  isPalindrome,
  hasAtLeastNVowels,
  checkWordAgainstObjective,
  checkObjectives,
  generateObjectives,
  type Objective,
  type ObjectiveType,
} from "../lib/utils/objectiveGenerator"

describe("Objective System", () => {
  describe("isPalindrome", () => {
    test("correctly identifies palindromes", () => {
      expect(isPalindrome("level")).toBe(true)
      expect(isPalindrome("radar")).toBe(true)
      expect(isPalindrome("madam")).toBe(true)
      expect(isPalindrome("racecar")).toBe(true)
    })

    test("rejects non-palindromes", () => {
      expect(isPalindrome("hello")).toBe(false)
      expect(isPalindrome("world")).toBe(false)
      expect(isPalindrome("test")).toBe(false)
      expect(isPalindrome("ton")).toBe(false)
      expect(isPalindrome("toys")).toBe(false)
    })

    test("requires at least 3 characters", () => {
      expect(isPalindrome("a")).toBe(false)
      expect(isPalindrome("aa")).toBe(false)
      expect(isPalindrome("aba")).toBe(true)
    })

    test("is case insensitive", () => {
      expect(isPalindrome("Level")).toBe(true)
      expect(isPalindrome("Radar")).toBe(true)
    })

    test("handles edge cases", () => {
      expect(isPalindrome("")).toBe(false)
      expect(isPalindrome(null as any)).toBe(false)
      expect(isPalindrome(undefined as any)).toBe(false)
      expect(isPalindrome(123 as any)).toBe(false)
    })
  })

  describe("hasAtLeastNVowels", () => {
    test("correctly counts vowels", () => {
      expect(hasAtLeastNVowels("hello", 2)).toBe(true) // 2 vowels
      expect(hasAtLeastNVowels("world", 1)).toBe(true) // 1 vowel
      expect(hasAtLeastNVowels("sky", 1)).toBe(false) // 0 vowels
      expect(hasAtLeastNVowels("beautiful", 4)).toBe(true) // 5 vowels
    })

    test("is case insensitive", () => {
      expect(hasAtLeastNVowels("HELLO", 2)).toBe(true)
      expect(hasAtLeastNVowels("World", 1)).toBe(true)
    })

    test("handles edge cases", () => {
      expect(hasAtLeastNVowels("", 1)).toBe(false)
      expect(hasAtLeastNVowels(null as any, 1)).toBe(false)
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

    test("length objective works correctly", () => {
      const objective3 = createObjective("length", 3)
      const objective4 = createObjective("length", 4)
      const objective6 = createObjective("length", 6)

      // 3-letter words
      expect(checkWordAgainstObjective("cat", objective3)).toBe(true)
      expect(checkWordAgainstObjective("dog", objective3)).toBe(true)
      expect(checkWordAgainstObjective("ton", objective3)).toBe(true)

      // 3-letter words should NOT match other length objectives
      expect(checkWordAgainstObjective("cat", objective4)).toBe(false)
      expect(checkWordAgainstObjective("dog", objective4)).toBe(false)
      expect(checkWordAgainstObjective("ton", objective4)).toBe(false)
      expect(checkWordAgainstObjective("ton", objective6)).toBe(false)

      // 4-letter words
      expect(checkWordAgainstObjective("test", objective4)).toBe(true)
      expect(checkWordAgainstObjective("word", objective4)).toBe(true)
      expect(checkWordAgainstObjective("toys", objective4)).toBe(true)

      // 6-letter words
      expect(checkWordAgainstObjective("garden", objective6)).toBe(true)
      expect(checkWordAgainstObjective("system", objective6)).toBe(true)
    })

    test("startsWith objective works correctly", () => {
      const objective = createObjective("startsWith", "t")

      expect(checkWordAgainstObjective("test", objective)).toBe(true)
      expect(checkWordAgainstObjective("ton", objective)).toBe(true)
      expect(checkWordAgainstObjective("toys", objective)).toBe(true)
      expect(checkWordAgainstObjective("cat", objective)).toBe(false)
    })

    test("endsWith objective works correctly", () => {
      const objective = createObjective("endsWith", "n")

      expect(checkWordAgainstObjective("ton", objective)).toBe(true)
      expect(checkWordAgainstObjective("run", objective)).toBe(true)
      expect(checkWordAgainstObjective("cat", objective)).toBe(false)
      expect(checkWordAgainstObjective("toys", objective)).toBe(false)
    })

    test("contains objective works correctly", () => {
      const objective = createObjective("contains", "o")

      expect(checkWordAgainstObjective("ton", objective)).toBe(true)
      expect(checkWordAgainstObjective("dog", objective)).toBe(true)
      expect(checkWordAgainstObjective("toys", objective)).toBe(true)
      expect(checkWordAgainstObjective("cat", objective)).toBe(false)
    })

    test("palindrome objective works correctly", () => {
      const objective = createObjective("palindrome", "palindrome")

      expect(checkWordAgainstObjective("level", objective)).toBe(true)
      expect(checkWordAgainstObjective("radar", objective)).toBe(true)
      expect(checkWordAgainstObjective("ton", objective)).toBe(false)
      expect(checkWordAgainstObjective("cat", objective)).toBe(false)
      expect(checkWordAgainstObjective("toys", objective)).toBe(false)
    })

    test("handles string parameters for length objectives", () => {
      const objective = createObjective("length", "3")

      expect(checkWordAgainstObjective("cat", objective)).toBe(true)
      expect(checkWordAgainstObjective("ton", objective)).toBe(true)
      expect(checkWordAgainstObjective("test", objective)).toBe(false)
      expect(checkWordAgainstObjective("toys", objective)).toBe(false)
    })

    test("handles invalid parameters gracefully", () => {
      const invalidObjective = createObjective("length", "not-a-number")

      expect(checkWordAgainstObjective("test", invalidObjective)).toBe(false)
      expect(checkWordAgainstObjective("toys", invalidObjective)).toBe(false)
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
          id: "palindrome",
          type: "palindrome",
          description: "Find a palindrome",
          parameter: "palindrome",
          completed: false,
        },
      ]

      // Test with "ton" - should complete length-3 and startsWith-t
      const completedWithTon = checkObjectives("ton", objectives, [])
      expect(completedWithTon).toContain("length-3")
      expect(completedWithTon).toContain("startsWith-t")
      expect(completedWithTon).not.toContain("palindrome")
      expect(completedWithTon.length).toBe(2)

      // Test with "toys" - should only complete startsWith-t
      const completedWithToys = checkObjectives("toys", objectives, [])
      expect(completedWithToys).not.toContain("length-3")
      expect(completedWithToys).toContain("startsWith-t")
      expect(completedWithToys).not.toContain("palindrome")
      expect(completedWithToys.length).toBe(1)

      // Test with "level" - should complete palindrome
      const completedWithLevel = checkObjectives("level", objectives, [])
      expect(completedWithLevel).not.toContain("length-3")
      expect(completedWithLevel).not.toContain("startsWith-t")
      expect(completedWithLevel).toContain("palindrome")
      expect(completedWithLevel.length).toBe(1)
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
      ]

      // Mark length-3 as already completed
      const alreadyCompleted = ["length-3"]

      // Test with "ton" - should only complete startsWith-t
      const completed = checkObjectives("ton", objectives, alreadyCompleted)
      expect(completed).not.toContain("length-3")
      expect(completed).toContain("startsWith-t")
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
