// Trie data structure for efficient word lookups
export class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean

  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
  }
}

export class Trie {
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
