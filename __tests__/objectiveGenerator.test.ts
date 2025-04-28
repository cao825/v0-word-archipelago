import {
  isPalindrome,
  hasAtLeastNVowels,
  checkWordAgainstObjective,
  generateObjectives,
} from "../lib/utils/objectiveGenerator"
import { describe, it, expect } from "@jest/globals"

describe("Objective Generator", () => {
  describe("isPalindrome", () => {
    it("should correctly identify palindromes", () => {
      expect(isPalindrome("level")).toBe(true)
      expect(isPalindrome("radar")).toBe(true)
      expect(isPalindrome("madam")).toBe(true)
      expect(isPalindrome("racecar")).toBe(true)
      expect(isPalindrome("A man a plan a canal Panama")).toBe(false) // Contains spaces
      expect(isPalindrome("Able was I ere I saw Elba")).toBe(false) // Contains spaces
    })

    it("should be case insensitive", () => {
      expect(isPalindrome("Level")).toBe(true)
      expect(isPalindrome("Radar")).toBe(true)
      expect(isPalindrome("Madam")).toBe(true)
    })

    it("should reject non-palindromes", () => {
      expect(isPalindrome("hello")).toBe(false)
      expect(isPalindrome("world")).toBe(false)
      expect(isPalindrome("test")).toBe(false)
    })

    it("should reject short words that are technically palindromes", () => {
      expect(isPalindrome("a")).toBe(false) // Single letter
      expect(isPalindrome("aa")).toBe(false) // Two letters
      expect(isPalindrome("bb")).toBe(false) // Two letters
      expect(isPalindrome("ton")).toBe(false) // Not a palindrome
      expect(isPalindrome("no")).toBe(false) // Not a palindrome
    })
  })

  describe("hasAtLeastNVowels", () => {
    it("should correctly count vowels", () => {
      expect(hasAtLeastNVowels("hello", 2)).toBe(true) // 2 vowels
      expect(hasAtLeastNVowels("world", 1)).toBe(true) // 1 vowel
      expect(hasAtLeastNVowels("sky", 1)).toBe(false) // 0 vowels
      expect(hasAtLeastNVowels("beautiful", 4)).toBe(true) // 5 vowels
    })

    it("should be case insensitive", () => {
      expect(hasAtLeastNVowels("HELLO", 2)).toBe(true)
      expect(hasAtLeastNVowels("World", 1)).toBe(true)
    })
  })

  describe("checkWordAgainstObjective", () => {
    it("should check long word objective", () => {
      const objective = {
        id: "find-long-word",
        description: "Find a word with 5 or more letters",
        points: 50,
        completed: false,
      }
      expect(checkWordAgainstObjective("hello", objective)).toBe(true)
      expect(checkWordAgainstObjective("hi", objective)).toBe(false)
    })

    it("should check palindrome objective", () => {
      const objective = {
        id: "find-palindrome",
        description: "Find a palindrome word",
        points: 75,
        completed: false,
      }
      expect(checkWordAgainstObjective("level", objective)).toBe(true)
      expect(checkWordAgainstObjective("hello", objective)).toBe(false)
      expect(checkWordAgainstObjective("ton", objective)).toBe(false) // Not a palindrome
    })

    it("should check vowel word objective", () => {
      const objective = {
        id: "find-vowel-word",
        description: "Find a word with at least 2 vowels",
        points: 30,
        completed: false,
      }
      expect(checkWordAgainstObjective("hello", objective)).toBe(true)
      expect(checkWordAgainstObjective("sky", objective)).toBe(false)
    })
  })

  describe("generateObjectives", () => {
    it("should generate objectives based on islands", () => {
      const islands = [
        { id: "1", letter: "L", position: { x: 0, y: 0 }, size: 40, connections: [] },
        { id: "2", letter: "E", position: { x: 0, y: 0 }, size: 40, connections: [] },
        { id: "3", letter: "V", position: { x: 0, y: 0 }, size: 40, connections: [] },
        { id: "4", letter: "E", position: { x: 0, y: 0 }, size: 40, connections: [] },
        { id: "5", letter: "L", position: { x: 0, y: 0 }, size: 40, connections: [] },
      ]
      const objectives = generateObjectives(islands)
      expect(objectives.length).toBeGreaterThan(0)
      expect(objectives.length).toBeLessThanOrEqual(3)
    })
  })
})
