import { hasAtLeastNVowels, checkWordAgainstObjective, generateObjectives } from "../lib/utils/objectiveGenerator"
import { describe, it, expect } from "@jest/globals"

describe("Objective Generator", () => {
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
        type: "length",
        description: "Find a word with 5 or more letters",
        parameter: 5,
        completed: false,
      }
      expect(checkWordAgainstObjective("hello", objective)).toBe(true)
      expect(checkWordAgainstObjective("hi", objective)).toBe(false)
    })

    it("should check startsWith objective", () => {
      const objective = {
        id: "starts-with-h",
        type: "startsWith",
        description: "Find a word starting with 'h'",
        parameter: "h",
        ompleted: false,
      }
      expect(checkWordAgainstObjective("hello", objective)).toBe(true)
      expect(checkWordAgainstObjective("world", objective)).toBe(false)
    })

    it("should check endsWith objective", () => {
      const objective = {
        id: "ends-with-d",
        type: "endsWith",
        description: "Find a word ending with 'd'",
        parameter: "d",
        completed: false,
      }
      expect(checkWordAgainstObjective("world", objective)).toBe(true)
      expect(checkWordAgainstObjective("hello", objective)).toBe(false)
    })

    it("should check contains objective", () => {
      const objective = {
        id: "contains-o",
        type: "contains",
        description: "Find a word containing 'o'",
        parameter: "o",
        completed: false,
      }
      expect(checkWordAgainstObjective("world", objective)).toBe(true)
      expect(checkWordAgainstObjective("hi", objective)).toBe(false)
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
      const objectives = generateObjectives(() => 0.5, islands)
      expect(objectives.length).toBeGreaterThan(0)
      expect(objectives.length).toBeLessThanOrEqual(3)
    })
  })
})
