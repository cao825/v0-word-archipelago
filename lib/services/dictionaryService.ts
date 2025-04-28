// Dictionary Service - Handles word validation and special rules

import { dictionary } from "../utils/dictionary"

// Create a Set for O(1) lookups
const dictionarySet = new Set(dictionary.map((word) => word.toLowerCase()))

// Create a Trie data structure for prefix lookups
class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean

  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

class Trie {
  root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  // Insert a word into the trie
  insert(word: string): void {
    let current = this.root
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
    }
    current.isEndOfWord = true
  }

  // Check if a word exists in the trie
  search(word: string): boolean {
    let current = this.root
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        return false
      }
      current = current.children.get(char)!
    }
    return current.isEndOfWord
  }

  // Check if there is any word in the trie that starts with the given prefix
  startsWith(prefix: string): boolean {
    let current = this.root
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return false
      }
      current = current.children.get(char)!
    }
    return true
  }
}

// Initialize the trie with all dictionary words
const dictionaryTrie = new Trie()
dictionary.forEach((word) => dictionaryTrie.insert(word))

// Special rules for word validation
const specialRules = {
  // Q must be followed by U in English words
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

  // Words must be at least 2 characters long
  minimumLength: (word: string): boolean => {
    return word.length >= 2
  },
}

// Main validation function
export function validateWord(word: string): boolean {
  if (!word) return false

  const lowerWord = word.toLowerCase()

  // Apply special rules
  if (!specialRules.minimumLength(lowerWord)) return false
  if (!specialRules.qRequiresU(lowerWord)) return false

  // Check if the word exists in our dictionary
  return dictionarySet.has(lowerWord)
}

// Function to check if a word could potentially be valid (for real-time feedback)
export function couldBeValidWord(prefix: string): boolean {
  if (!prefix) return true

  const lowerPrefix = prefix.toLowerCase()

  // Apply special rules that can be checked on prefixes
  if (!specialRules.qRequiresU(lowerPrefix)) return false

  // Check if any word in the dictionary starts with this prefix
  return dictionaryTrie.startsWith(lowerPrefix)
}

// Function to get possible words from available letters
export function getPossibleWords(letters: string[]): string[] {
  // This is a simplified implementation - in a real app, you might want to use
  // a more sophisticated algorithm to find all possible words
  return dictionary.filter((word) => {
    const letterCounts = new Map<string, number>()

    // Count available letters
    for (const letter of letters) {
      letterCounts.set(letter.toLowerCase(), (letterCounts.get(letter.toLowerCase()) || 0) + 1)
    }

    // Check if the word can be formed
    for (const char of word.toLowerCase()) {
      const count = letterCounts.get(char) || 0
      if (count <= 0) return false
      letterCounts.set(char, count - 1)
    }

    return true
  })
}

// Function to get word difficulty (1-10 scale)
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

// Export the dictionary for other uses
export { dictionary, dictionarySet, dictionaryTrie }
