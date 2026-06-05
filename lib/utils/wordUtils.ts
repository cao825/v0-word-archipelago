import type { Island } from "../slices/gameSlice"
import { dictionary } from "../services/dictionaryService"

// Check if a word can be formed with the available islands
export function canFormWord(word: string, islands: Island[]): boolean {
  // Get all available letters
  const availableLetters = islands.map((island) => island.letter.toLowerCase())

  // Check if all letters in the word are available
  const wordLetters = word.toLowerCase().split("")

  // Count occurrences of each letter in the word
  const wordLetterCounts = new Map<string, number>()
  for (const letter of wordLetters) {
    wordLetterCounts.set(letter, (wordLetterCounts.get(letter) || 0) + 1)
  }

  // Count occurrences of each letter in the islands
  const islandLetterCounts = new Map<string, number>()
  for (const letter of availableLetters) {
    islandLetterCounts.set(letter, (islandLetterCounts.get(letter) || 0) + 1)
  }

  // Check if we have enough of each letter
  for (const [letter, count] of wordLetterCounts.entries()) {
    if ((islandLetterCounts.get(letter) || 0) < count) {
      return false
    }
  }

  return true
}

// Find all possible words that can be formed with the available islands
export function findPossibleWords(islands: Island[]): string[] {
  const availableLetters = islands.map((island) => island.letter.toLowerCase())

  // Filter the dictionary to only include words that can be formed
  return dictionary.filter((word) => canFormWord(word, islands))
}
