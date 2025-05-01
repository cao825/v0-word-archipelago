/**
 * Utility to check if words are in the dictionary
 */
import { dictionarySet } from "../services/dictionaryService"

/**
 * Check if a list of words are in the dictionary
 * @param words Array of words to check
 * @returns Object with found and missing words
 */
export function checkWordsInDictionary(words: string[]): {
  found: string[]
  missing: string[]
} {
  const found: string[] = []
  const missing: string[] = []

  words.forEach((word) => {
    const lowerWord = word.toLowerCase()
    if (dictionarySet.has(lowerWord)) {
      found.push(word)
    } else {
      missing.push(word)
    }
  })

  return { found, missing }
}

/**
 * Check if a specific word is in the dictionary
 * @param word Word to check
 * @returns Boolean indicating if the word is in the dictionary
 */
export function isWordInDictionary(word: string): boolean {
  return dictionarySet.has(word.toLowerCase())
}

/**
 * Get a count of words in the dictionary
 * @returns Number of words in the dictionary
 */
export function getDictionarySize(): number {
  return dictionarySet.size
}

/**
 * Check if a word starts with a specific prefix
 * @param prefix Prefix to check
 * @returns Array of words that start with the prefix
 */
export function getWordsWithPrefix(prefix: string): string[] {
  const lowerPrefix = prefix.toLowerCase()
  return Array.from(dictionarySet)
    .filter((word) => word.startsWith(lowerPrefix))
    .sort()
}

/**
 * Add a word to the dictionary
 * @param word Word to add
 * @returns Boolean indicating if the word was added (true) or already existed (false)
 */
export function addWordToDictionary(word: string): boolean {
  const lowerWord = word.toLowerCase()
  if (dictionarySet.has(lowerWord)) {
    return false
  }

  dictionarySet.add(lowerWord)
  return true
}
