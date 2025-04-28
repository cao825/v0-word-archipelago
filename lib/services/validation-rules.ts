// Special rules for word validation

/**
 * Collection of special validation rules for words
 */
export const validationRules = {
  /**
   * Ensures Q is followed by U in English words
   * @param word The word to check
   * @returns Boolean indicating if the rule is satisfied
   */
  qRequiresU: (word: string): boolean => {
    const lowerWord = word.toLowerCase()
    for (let i = 0; i < lowerWord.length; i++) {
      if (lowerWord[i] === "q") {
        // Check if q is followed by u
        if (i === lowerWord.length - 1 || lowerWord[i + 1] !== "u") {
          return false
        }
      }
    }
    return true
  },

  /**
   * Ensures words meet minimum length requirement
   * @param word The word to check
   * @returns Boolean indicating if the rule is satisfied
   */
  minimumLength: (word: string): boolean => {
    return word.length >= 2
  },
}

/**
 * Apply all validation rules to a word
 * @param word The word to validate
 * @returns Boolean indicating if all rules pass
 */
export function applyValidationRules(word: string): boolean {
  if (!word) return false

  const lowerWord = word.toLowerCase()

  // Apply all rules
  return validationRules.minimumLength(lowerWord) && validationRules.qRequiresU(lowerWord)
}
