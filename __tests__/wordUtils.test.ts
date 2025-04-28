import { canFormWord, findPossibleWords } from "../lib/utils/wordUtils"
import type { Island } from "../lib/slices/gameSlice"
import { describe, it, expect, jest } from "@jest/globals"

describe("Word Utils", () => {
  // Mock islands for testing
  const mockIslands: Island[] = [
    { id: "island-1", letter: "L", position: { x: 100, y: 100 }, size: 40, connections: ["island-2"] },
    { id: "island-2", letter: "O", position: { x: 200, y: 200 }, size: 40, connections: ["island-1", "island-3"] },
    { id: "island-3", letter: "U", position: { x: 300, y: 300 }, size: 40, connections: ["island-2", "island-4"] },
    { id: "island-4", letter: "D", position: { x: 400, y: 400 }, size: 40, connections: ["island-3"] },
  ]

  describe("canFormWord", () => {
    it("should correctly identify words that can be formed with available islands", () => {
      expect(canFormWord("loud", mockIslands)).toBe(true)
      expect(canFormWord("old", mockIslands)).toBe(true)
      expect(canFormWord("do", mockIslands)).toBe(true)
      expect(canFormWord("lo", mockIslands)).toBe(true)
    })

    it("should be case insensitive", () => {
      expect(canFormWord("LOUD", mockIslands)).toBe(true)
      expect(canFormWord("Loud", mockIslands)).toBe(true)
      expect(canFormWord("lOuD", mockIslands)).toBe(true)
    })

    it("should reject words that cannot be formed with available islands", () => {
      expect(canFormWord("love", mockIslands)).toBe(false) // Missing 'V' and 'E'
      expect(canFormWord("sound", mockIslands)).toBe(false) // Missing 'S' and 'N'
      expect(canFormWord("volume", mockIslands)).toBe(false) // Missing 'V', 'M', and 'E'
    })

    it("should handle words with repeated letters correctly", () => {
      // Create islands with repeated letters
      const islandsWithRepeats: Island[] = [
        ...mockIslands,
        { id: "island-5", letter: "O", position: { x: 500, y: 500 }, size: 40, connections: ["island-4"] },
      ]

      expect(canFormWord("loo", islandsWithRepeats)).toBe(true) // Uses repeated 'O'
      expect(canFormWord("doll", islandsWithRepeats)).toBe(false) // Needs two 'L's but we only have one
    })

    it("should handle empty input correctly", () => {
      expect(canFormWord("", mockIslands)).toBe(true) // Empty word can always be formed
    })
  })

  describe("findPossibleWords", () => {
    // Mock the dictionary module
    jest.mock("../lib/utils/wordValidator", () => ({
      dictionary: ["loud", "old", "do", "lo", "out", "lot", "doll", "love"],
    }))

    it("should find all possible words that can be formed with available islands", () => {
      // This test depends on the mocked dictionary
      const possibleWords = findPossibleWords(mockIslands)

      // These words should be in the result
      expect(possibleWords).toContain("loud")
      expect(possibleWords).toContain("old")
      expect(possibleWords).toContain("do")
      expect(possibleWords).toContain("lo")

      // These words should not be in the result
      expect(possibleWords).not.toContain("love")
      expect(possibleWords).not.toContain("doll")
    })

    it("should return an empty array if no words can be formed", () => {
      // Islands with uncommon letters that likely won't form words
      const uncommonIslands: Island[] = [
        { id: "island-1", letter: "X", position: { x: 100, y: 100 }, size: 40, connections: [] },
        { id: "island-2", letter: "Z", position: { x: 200, y: 200 }, size: 40, connections: [] },
        { id: "island-3", letter: "Q", position: { x: 300, y: 300 }, size: 40, connections: [] },
      ]

      const possibleWords = findPossibleWords(uncommonIslands)
      expect(possibleWords.length).toBe(0)
    })
  })
})
