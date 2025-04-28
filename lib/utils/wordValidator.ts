// Import the dictionary service
import { validateWord as validateWordService, dictionary } from "../services/dictionaryService"

// Create a Set for O(1) lookups instead of array search
const dictionarySet = new Set(dictionary.map((word) => word.toLowerCase()))

export function validateWord(word: string): boolean {
  // Use the service for validation
  return validateWordService(word)
}

// Export the dictionary for other uses
export { dictionary }
