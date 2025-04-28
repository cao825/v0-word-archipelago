import { validateWord } from "../lib/utils/wordValidator"
import { validateWord as validateWordService } from "../lib/services/dictionaryService"

// Mock the dictionary service
jest.mock("../lib/services/dictionaryService", () => ({
  validateWord: jest.fn((word) => {
    // Simple mock dictionary for testing
    const validWords = ["at", "ate", "tea", "cat", "dog", "queen", "quick"]
    return validWords.includes(word.toLowerCase())
  }),
  dictionary: ["at", "ate", "tea", "cat", "dog", "queen", "quick"],
}))

describe("Word Validator", () => {
  it("should validate words correctly", () => {
    expect(validateWord("at")).toBe(true)
    expect(validateWord("ate")).toBe(true)
    expect(validateWord("tea")).toBe(true)
    expect(validateWord("cat")).toBe(true)
    expect(validateWord("dog")).toBe(true)
  })

  it("should reject invalid words", () => {
    expect(validateWord("xyz")).toBe(false)
    expect(validateWord("notaword")).toBe(false)
  })

  it("should be case insensitive", () => {
    expect(validateWord("AT")).toBe(true)
    expect(validateWord("At")).toBe(true)
    expect(validateWord("aT")).toBe(true)
    expect(validateWord("CAT")).toBe(true)
  })

  it("should handle empty input", () => {
    expect(validateWord("")).toBe(false)
  })

  it("should call the dictionary service", () => {
    validateWord("test")
    expect(validateWordService).toHaveBeenCalledWith("test")
  })
})
