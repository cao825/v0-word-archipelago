// Dictionary Service - Handles word validation and dictionary operations
// Uses comprehensive English dictionary (275,000+ words)
import words from "an-array-of-english-words"
import { Trie } from "./trie"
import { canFormWord, getWordDifficulty } from "./word-utils"
import { applyValidationRules } from "./validation-rules"

// Minimum word length for validation (game rule)
const MIN_WORD_LENGTH = 3

// Create a Set for O(1) lookups - filter to 3+ letter words for game purposes
const dictionarySet = new Set(
  words.filter((word) => word.length >= MIN_WORD_LENGTH).map((word) => word.toLowerCase())
)

// Initialize the trie with all dictionary words
const dictionaryTrie = new Trie()
dictionarySet.forEach((word) => dictionaryTrie.insert(word))

// Also keep 2-letter words available for potential future use or special rules
const twoLetterWords = new Set(
  words.filter((word) => word.length === 2).map((word) => word.toLowerCase())
)

// Export the dictionary as an array for compatibility with existing code
const dictionary = Array.from(dictionarySet)

/**
 * Validate if a word is valid according to game rules
 */
export function validateWord(word: string): boolean {
  if (!word) return false

  const lowerWord = word.toLowerCase()

  // Minimum length check
  if (lowerWord.length < MIN_WORD_LENGTH) return false

  // Apply validation rules (handles patterns like Q without U, etc.)
  if (!applyValidationRules(lowerWord)) return false

  // Check dictionary
  return dictionarySet.has(lowerWord)
}

/**
 * Check if a prefix could potentially form a valid word
 */
export function couldBeValidWord(prefix: string): boolean {
  if (!prefix) return true

  const lowerPrefix = prefix.toLowerCase()

  // Apply prefix validation rules
  if (!applyValidationRules.qRequiresU(lowerPrefix)) return false

  // Check trie for prefix
  return dictionaryTrie.startsWith(lowerPrefix)
}

/**
 * Find all possible words that can be formed with given letters
 */
export function getPossibleWords(letters: string[]): string[] {
  const possibleWords: string[] = []

  for (const word of dictionarySet) {
    if (canFormWord(word, letters)) {
      possibleWords.push(word)
    }
  }

  return possibleWords
}

/**
 * Check if a 2-letter word is valid (for special game modes)
 */
export function isValidTwoLetterWord(word: string): boolean {
  if (!word || word.length !== 2) return false
  return twoLetterWords.has(word.toLowerCase())
}

export { dictionary, dictionarySet, dictionaryTrie, getWordDifficulty }
