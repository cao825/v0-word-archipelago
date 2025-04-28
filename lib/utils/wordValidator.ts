// Import the dictionary service
import { validateWord as validateWordService, dictionary } from "../services/dictionaryService"

export function validateWord(word: string): boolean {
  // Use the service for validation
  return validateWordService(word)
}

// Export the dictionary for other uses
export { dictionary }
