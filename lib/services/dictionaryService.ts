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

// Function to generate common plural forms
function generatePlurals(words: string[]): string[] {
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

// Generate plurals for words in the dictionary
const generatedPlurals = generatePlurals(dictionary)

// Add generated plurals to the dictionary set and trie
generatedPlurals.forEach((plural) => {
  if (!dictionarySet.has(plural)) {
    dictionarySet.add(plural)
    dictionaryTrie.insert(plural)
  }
})

// Comprehensive list of common English words that might be missing
// This is a fallback to ensure common words are always recognized
const commonEnglishWords = new Set([
  // Common 2-letter words
  "ad",
  "am",
  "an",
  "as",
  "at",
  "be",
  "by",
  "do",
  "go",
  "he",
  "hi",
  "if",
  "in",
  "is",
  "it",
  "me",
  "my",
  "no",
  "of",
  "on",
  "or",
  "ox",
  "so",
  "to",
  "up",
  "us",
  "we",
  "ye",

  // Common 3-letter words
  "ace",
  "act",
  "add",
  "ado",
  "age",
  "ago",
  "aid",
  "aim",
  "air",
  "ale",
  "all",
  "and",
  "ant",
  "any",
  "ape",
  "apt",
  "arc",
  "are",
  "ark",
  "arm",
  "art",
  "ash",
  "ask",
  "ate",
  "awe",
  "awl",
  "aye",
  "bad",
  "bag",
  "ban",
  "bar",
  "bat",
  "bay",
  "bed",
  "bee",
  "beg",
  "bet",
  "bid",
  "big",
  "bin",
  "bit",
  "bog",
  "boo",
  "bow",
  "box",
  "boy",
  "bud",
  "bug",
  "bum",
  "bun",
  "bus",
  "but",
  "buy",
  "cab",
  "cad",
  "cam",
  "can",
  "cap",
  "car",
  "cat",
  "caw",
  "cay",
  "cob",
  "cod",
  "cog",
  "con",
  "coo",
  "cop",
  "cor",
  "cos",
  "cot",
  "cow",
  "coy",
  "cry",
  "cub",
  "cud",
  "cue",
  "cup",
  "cut",
  "dab",
  "dad",
  "dam",
  "day",
  "den",
  "dew",
  "did",
  "die",
  "dig",
  "dim",
  "din",
  "dip",
  "doe",
  "dog",
  "don",
  "dot",
  "dry",
  "dub",
  "due",
  "dug",
  "duh",
  "dun",
  "duo",
  "dye",
  "ear",
  "eat",
  "ebb",
  "egg",
  "ego",
  "elf",
  "elk",
  "elm",
  "emu",
  "end",
  "era",
  "erg",
  "err",
  "eve",
  "ewe",
  "eye",
  "fab",
  "fad",
  "fan",
  "far",
  "fat",
  "fax",
  "fee",
  "fen",
  "few",
  "fib",
  "fig",
  "fin",
  "fir",
  "fit",
  "fix",
  "flu",
  "fly",
  "foe",
  "fog",
  "for",
  "fox",
  "fry",
  "fun",
  "fur",
  "gag",
  "gap",
  "gas",
  "gay",
  "gel",
  "gem",
  "get",
  "gig",
  "gin",
  "goo",
  "got",
  "gum",
  "gun",
  "gut",
  "guy",
  "gym",
  "had",
  "hag",
  "ham",
  "has",
  "hat",
  "hay",
  "hem",
  "hen",
  "her",
  "hey",
  "hid",
  "him",
  "hip",
  "his",
  "hit",
  "hog",
  "hop",
  "hot",
  "how",
  "hub",
  "hue",
  "hug",
  "huh",
  "hum",
  "hut",
  "ice",
  "icy",
  "ill",
  "imp",
  "ink",
  "inn",
  "ion",
  "ire",
  "irk",
  "its",
  "ivy",
  "jab",
  "jag",
  "jam",
  "jar",
  "jaw",
  "jay",
  "jet",
  "jig",
  "job",
  "jog",
  "jot",
  "joy",
  "jug",
  "jut",
  "keg",
  "ken",
  "key",
  "kid",
  "kin",
  "kit",
  "lab",
  "lac",
  "lad",
  "lag",
  "lam",
  "lap",
  "law",
  "lax",
  "lay",
  "lea",
  "led",
  "lee",
  "leg",
  "let",
  "lid",
  "lie",
  "lip",
  "lit",
  "lob",
  "log",
  "loo",
  "lop",
  "lot",
  "low",
  "lug",
  "lye",
  "mad",
  "mag",
  "man",
  "map",
  "mar",
  "mat",
  "maw",
  "may",
  "men",
  "met",
  "mew",
  "mid",
  "mix",
  "mob",
  "mod",
  "mom",
  "moo",
  "mop",
  "mow",
  "mud",
  "mug",
  "mum",
  "nab",
  "nag",
  "nap",
  "nay",
  "nee",
  "net",
  "new",
  "nib",
  "nil",
  "nip",
  "nit",
  "nix",
  "nod",
  "nor",
  "not",
  "now",
  "nun",
  "nut",
  "oak",
  "odd",
  "off",
  "oft",
  "ohm",
  "oil",
  "old",
  "one",
  "orb",
  "ore",
  "our",
  "out",
  "owe",
  "owl",
  "own",
  "pad",
  "pal",
  "pan",
  "pap",
  "par",
  "pat",
  "paw",
  "pay",
  "pea",
  "peg",
  "pen",
  "pep",
  "per",
  "pet",
  "pew",
  "phi",
  "pie",
  "pig",
  "pin",
  "pip",
  "pit",
  "ply",
  "pod",
  "poo",
  "pop",
  "pot",
  "pow",
  "pox",
  "pro",
  "pry",
  "pub",
  "pug",
  "pun",
  "pup",
  "put",
  "rad",
  "rag",
  "raj",
  "ram",
  "ran",
  "rap",
  "rat",
  "raw",
  "ray",
  "red",
  "rib",
  "rid",
  "rig",
  "rim",
  "rip",
  "rob",
  "rod",
  "roe",
  "rot",
  "row",
  "rub",
  "rue",
  "rug",
  "rum",
  "run",
  "rut",
  "rye",
  "sad",
  "sag",
  "sal",
  "sap",
  "sat",
  "saw",
  "say",
  "sea",
  "see",
  "set",
  "sew",
  "sex",
  "she",
  "shy",
  "sic",
  "sin", // Added "sin" here
  "sip",
  "sir",
  "sis",
  "sit",
  "six",
  "ski",
  "sky",
  "sly",
  "sob",
  "sod",
  "son",
  "sow",
  "spa",
  "spy",
  "sub",
  "sue",
  "sum",
  "sun",
  "sup",
  "tab",
  "tad",
  "tag",
  "tam",
  "tan",
  "tap",
  "tar",
  "tat",
  "tax",
  "tea",
  "tee",
  "ten",
  "the",
  "thy",
  "tic",
  "tie",
  "til",
  "tin",
  "tip",
  "toe",
  "tog",
  "tom",
  "ton",
  "too",
  "top",
  "tow",
  "toy",
  "try",
  "tub",
  "tug",
  "tut",
  "two",
  "ugh",
  "uke",
  "ump",
  "urn",
  "use",
  "van",
  "vat",
  "vee",
  "vet",
  "vex",
  "via",
  "vie",
  "vim",
  "vow",
  "wad",
  "wag",
  "wan",
  "war",
  "was",
  "wax",
  "way",
  "web",
  "wed",
  "wee",
  "wet",
  "who",
  "why",
  "wig",
  "win",
  "wit",
  "woe",
  "wok",
  "won",
  "woo",
  "wow",
  "wry",
  "yak",
  "yam",
  "yap",
  "yaw",
  "yay",
  "yea",
  "yen",
  "yes",
  "yet",
  "yew",
  "yip",
  "you",
  "yuk",
  "yum",
  "zag",
  "zap",
  "zen",
  "zig",
  "zip",
  "zoo",
])

// Add common English words to the dictionary set and trie
commonEnglishWords.forEach((word) => {
  if (!dictionarySet.has(word)) {
    dictionarySet.add(word)
    dictionaryTrie.insert(word)
  }
})

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
  if (dictionarySet.has(lowerWord)) return true

  // Check in our comprehensive common words list as a fallback
  if (commonEnglishWords.has(lowerWord)) return true

  return false
}

// Function to check if a word could potentially be valid (for real-time feedback)
export function couldBeValidWord(prefix: string): boolean {
  if (!prefix) return true

  const lowerPrefix = prefix.toLowerCase()

  // Apply special rules that can be checked on prefixes
  if (!specialRules.qRequiresU(lowerPrefix)) return false

  // Check if any word in the dictionary starts with this prefix
  if (dictionaryTrie.startsWith(lowerPrefix)) return true

  // Check if any common word starts with this prefix
  for (const word of commonEnglishWords) {
    if (word.startsWith(lowerPrefix)) return true
  }

  return false
}

// Function to get possible words from available letters
export function getPossibleWords(letters: string[]): string[] {
  // This is a simplified implementation - in a real app, you might want to use
  // a more sophisticated algorithm to find all possible words
  const possibleWords: string[] = []

  // Check dictionary words
  for (const word of dictionary) {
    if (canFormWord(word, letters)) {
      possibleWords.push(word)
    }
  }

  // Check common words
  for (const word of commonEnglishWords) {
    if (canFormWord(word, letters) && !possibleWords.includes(word)) {
      possibleWords.push(word)
    }
  }

  return possibleWords
}

// Helper function to check if a word can be formed with given letters
function canFormWord(word: string, availableLetters: string[]): boolean {
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
