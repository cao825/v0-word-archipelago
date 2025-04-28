// Utility functions for word processing

/**
 * Generate plural forms of words based on common English rules
 * @param words Array of singular words
 * @returns Array of plural forms
 */
export function generatePlurals(words: string[]): string[] {
  const plurals: string[] = []

  words.forEach((word) => {
    // Skip words that are already plurals or too short
    if (word.length < 3) return

    // Common plural rules
    if (word.endsWith("y")) {
      // city -> cities, but boy -> boys
      const isConsonantBeforeY = !["a", "e", "i", "o", "u"].includes(word[word.length - 2])
      if (isConsonantBeforeY) {
        plurals.push(word.slice(0, -1) + "ies")
      } else {
        plurals.push(word + "s")
      }
    } else if (
      word.endsWith("s") ||
      word.endsWith("x") ||
      word.endsWith("z") ||
      word.endsWith("ch") ||
      word.endsWith("sh") ||
      word.endsWith("z") ||
      word.endsWith("ch") ||
      word.endsWith("sh")
    ) {
      // bus -> buses, box -> boxes, church -> churches
      plurals.push(word + "es")
    } else if (word.endsWith("f")) {
      // leaf -> leaves
      plurals.push(word.slice(0, -1) + "ves")
    } else if (word.endsWith("fe")) {
      // knife -> knives
      plurals.push(word.slice(0, -2) + "ves")
    } else {
      // Regular plurals: cat -> cats
      plurals.push(word + "s")
    }
  })

  return plurals
}

/**
 * Check if a word can be formed with the given letters
 * @param word The word to check
 * @param availableLetters Array of available letters
 * @returns Boolean indicating if the word can be formed
 */
export function canFormWord(word: string, availableLetters: string[]): boolean {
  const letterCounts = new Map<string, number>()

  // Count available letters
  for (const letter of availableLetters) {
    const lowerLetter = letter.toLowerCase()
    letterCounts.set(lowerLetter, (letterCounts.get(lowerLetter) || 0) + 1)
  }

  // Check if the word can be formed
  for (const char of word.toLowerCase()) {
    const count = letterCounts.get(char) || 0
    if (count <= 0) return false
    letterCounts.set(char, count - 1)
  }

  return true
}

/**
 * Calculate word difficulty on a scale of 1-10
 * @param word The word to evaluate
 * @returns Difficulty score from 1-10
 */
export function getWordDifficulty(word: string): number {
  // Simple algorithm based on word length and uncommon letters
  const uncommonLetters = "jqxzvwkfy"
  let difficulty = Math.min(10, Math.max(1, Math.floor(word.length / 2)))

  // Add points for uncommon letters
  for (const char of word.toLowerCase()) {
    if (uncommonLetters.includes(char)) {
      difficulty += 1
    }
  }

  return Math.min(10, difficulty)
}
