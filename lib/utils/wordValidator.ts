// This is a simplified dictionary for demo purposes
// In a real implementation, you would use a more comprehensive dictionary
import { dictionary } from "./dictionary"

// Create a Set for O(1) lookups instead of array search
const dictionarySet = new Set(dictionary.map((word) => word.toLowerCase()))

export function validateWord(word: string): boolean {
  return dictionarySet.has(word.toLowerCase())
}

// Export the dictionary for other uses
export { dictionary }
