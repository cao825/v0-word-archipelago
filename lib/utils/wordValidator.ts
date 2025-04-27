// Import the dictionary from the separate file
import { dictionary } from "./dictionary"

// Create a Set for O(1) lookups instead of array search
const dictionarySet = new Set(dictionary.map((word) => word.toLowerCase()))

export function validateWord(word: string): boolean {
  // Convert to lowercase for case-insensitive comparison
  const lowercaseWord = word.toLowerCase()

  // Check if the word exists in our dictionary set
  const isValid = dictionarySet.has(lowercaseWord)

  // For debugging
  if (!isValid && (lowercaseWord === "boat" || lowercaseWord === "tag")) {
    console.warn(`Word "${lowercaseWord}" not found in dictionary. Dictionary size: ${dictionarySet.size}`)
  }

  return isValid
}

// Export the dictionary for other uses
export { dictionary }
