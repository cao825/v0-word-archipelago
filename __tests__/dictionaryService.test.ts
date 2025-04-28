import { validateWord, couldBeValidWord, getWordDifficulty } from "../lib/services/dictionaryService"
import { dictionary } from "../lib/utils/dictionary"

describe("Dictionary Service", () => {
  describe("validateWord", () => {
    it("should validate common words correctly", () => {
      // Test a variety of common words
      expect(validateWord("at")).toBe(true)
      expect(validateWord("the")).toBe(true)
      expect(validateWord("and")).toBe(true)
      expect(validateWord("loud")).toBe(true)
      expect(validateWord("water")).toBe(true)
      expect(validateWord("computer")).toBe(true)
    })

    it("should be case insensitive", () => {
      expect(validateWord("LOUD")).toBe(true)
      expect(validateWord("Loud")).toBe(true)
      expect(validateWord("lOuD")).toBe(true)
    })

    it("should reject words that are not in the dictionary", () => {
      expect(validateWord("xyzabc")).toBe(false)
      expect(validateWord("qwerty")).toBe(false)
      expect(validateWord("asdfgh")).toBe(false)
    })

    it("should reject words less than 2 characters", () => {
      expect(validateWord("a")).toBe(false)
      expect(validateWord("")).toBe(false)
    })

    it("should enforce Q must be followed by U rule", () => {
      expect(validateWord("queen")).toBe(true)
      expect(validateWord("quiet")).toBe(true)
      expect(validateWord("qat")).toBe(false) // Q not followed by U
      expect(validateWord("qoph")).toBe(false) // Q not followed by U
    })
  })

  describe("couldBeValidWord", () => {
    it("should return true for prefixes of valid words", () => {
      expect(couldBeValidWord("l")).toBe(true) // Could be "loud", "love", etc.
      expect(couldBeValidWord("lo")).toBe(true) // Could be "loud", "love", etc.
      expect(couldBeValidWord("lou")).toBe(true) // Could be "loud"
      expect(couldBeValidWord("wa")).toBe(true) // Could be "water", "was", etc.
    })

    it("should return false for prefixes that cannot form valid words", () => {
      expect(couldBeValidWord("zq")).toBe(false)
      expect(couldBeValidWord("xz")).toBe(false)
    })

    it("should enforce Q must be followed by U rule for prefixes", () => {
      expect(couldBeValidWord("qu")).toBe(true)
      expect(couldBeValidWord("q")).toBe(false) // Q must be followed by U
      expect(couldBeValidWord("qa")).toBe(false) // Q must be followed by U
    })

    it("should handle empty input", () => {
      expect(couldBeValidWord("")).toBe(true) // Empty string could start any word
    })
  })

  describe("getWordDifficulty", () => {
    it("should assign higher difficulty to longer words", () => {
      const shortWordDifficulty = getWordDifficulty("at")
      const mediumWordDifficulty = getWordDifficulty("loud")
      const longWordDifficulty = getWordDifficulty("computer")

      expect(shortWordDifficulty).toBeLessThan(mediumWordDifficulty)
      expect(mediumWordDifficulty).toBeLessThan(longWordDifficulty)
    })

    it("should assign higher difficulty to words with uncommon letters", () => {
      const commonLettersWord = getWordDifficulty("ate")
      const uncommonLettersWord = getWordDifficulty("jazz")

      expect(commonLettersWord).toBeLessThan(uncommonLettersWord)
    })

    it("should return a value between 1 and 10", () => {
      const words = ["a", "at", "cat", "loud", "water", "computer", "xylophone", "quizzical"]

      words.forEach((word) => {
        const difficulty = getWordDifficulty(word)
        expect(difficulty).toBeGreaterThanOrEqual(1)
        expect(difficulty).toBeLessThanOrEqual(10)
      })
    })
  })

  describe("Dictionary Content", () => {
    it("should contain common English words", () => {
      const commonWords = [
        "the",
        "be",
        "to",
        "of",
        "and",
        "a",
        "in",
        "that",
        "have",
        "I",
        "it",
        "for",
        "not",
        "on",
        "with",
        "he",
        "as",
        "you",
        "do",
        "at",
        "this",
        "but",
        "his",
        "by",
        "from",
        "they",
        "we",
        "say",
        "her",
        "she",
        "or",
        "an",
        "will",
        "my",
        "one",
        "all",
        "would",
        "there",
        "their",
        "what",
        "so",
        "up",
        "out",
        "if",
        "about",
        "who",
        "get",
        "which",
        "go",
        "me",
        "when",
        "make",
        "can",
        "like",
        "time",
        "no",
        "just",
        "him",
        "know",
        "take",
        "people",
        "into",
        "year",
        "your",
        "good",
        "some",
        "could",
        "them",
        "see",
        "other",
        "than",
        "then",
        "now",
        "look",
        "only",
        "come",
        "its",
        "over",
        "think",
        "also",
        "back",
        "after",
        "use",
        "two",
        "how",
        "our",
        "work",
        "first",
        "well",
        "way",
        "even",
        "new",
        "want",
        "because",
        "any",
        "these",
        "give",
        "day",
        "most",
        "us",
        "loud",
        "sound",
        "noise",
        "volume",
        "hear",
        "voice",
        "speak",
        "shout",
        "quiet",
        "silent",
      ]

      commonWords.forEach((word) => {
        expect(dictionary.includes(word.toLowerCase())).toBe(true)
      })
    })

    it("should contain at least 1000 words", () => {
      expect(dictionary.length).toBeGreaterThanOrEqual(1000)
    })

    it("should not contain duplicate words", () => {
      const uniqueWords = new Set(dictionary)
      expect(uniqueWords.size).toBe(dictionary.length)
    })

    it("should not contain words with special characters or spaces", () => {
      const invalidCharRegex = /[^a-z]/i
      dictionary.forEach((word) => {
        expect(invalidCharRegex.test(word)).toBe(false)
      })
    })
  })
})
