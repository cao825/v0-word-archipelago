// Dictionary Service - Handles word validation and dictionary operations
import { dictionary } from "../dictionary"
import { Trie } from "./trie"
import { generatePlurals, canFormWord, getWordDifficulty } from "./word-utils"
import { applyValidationRules } from "./validation-rules"

// Add this to the top of the file, after the imports
console.log(`Dictionary loaded with ${dictionary.length} words`)

// Create a Set for O(1) lookups
const dictionarySet = new Set(dictionary.map((word) => word.toLowerCase()))

// Initialize the trie with all dictionary words
const dictionaryTrie = new Trie()
dictionary.forEach((word) => dictionaryTrie.insert(word))

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

  // Common 3-letter words that might be missing
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
  "sin",
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

// Add this after the commonEnglishWords are added to the dictionary
console.log(`Dictionary expanded to ${dictionarySet.size} words with common words and plurals`)

/**
 * Validate if a word is valid according to game rules
 * @param word The word to validate
 * @returns Boolean indicating if the word is valid
 */
export function validateWord(word: string): boolean {
  if (!word) return false

  const lowerWord = word.toLowerCase()

  // Apply special rules
  if (!applyValidationRules(lowerWord)) return false

  // Check if the word exists in our dictionary
  if (dictionarySet.has(lowerWord)) {
    return true
  }

  // Check in our comprehensive common words list as a fallback
  if (commonEnglishWords.has(lowerWord)) {
    // If we find it in the common words list but not in the dictionary,
    // add it to the dictionary for future lookups
    if (!dictionarySet.has(lowerWord)) {
      dictionarySet.add(lowerWord)
      dictionaryTrie.insert(lowerWord)
      console.log(`Added missing common word to dictionary: ${lowerWord}`)
    }
    return true
  }

  // Add this special case for chef and other culinary terms
  // Special case for "plot" and other potentially missing words
  const specialCaseWords = [
    "plot",
    "plug",
    "plan",
    "play",
    "plum",
    "plus",
    "chef",
    "chefs",
    "cook",
    "cooks",
    "bake",
    "bakes",
    "mere",
    "meaner",
    "mean",
    "means",
    "meant",
    "meaning",
    "meaningful",
    "meaningless",
  ]
  if (specialCaseWords.includes(lowerWord)) {
    // Add these to the dictionary if they're missing
    if (!dictionarySet.has(lowerWord)) {
      dictionarySet.add(lowerWord)
      dictionaryTrie.insert(lowerWord)
      console.log(`Added special case word to dictionary: ${lowerWord}`)
    }
    return true
  }

  return false
}

/**
 * Check if a prefix could potentially form a valid word
 * @param prefix The prefix to check
 * @returns Boolean indicating if the prefix could form a valid word
 */
export function couldBeValidWord(prefix: string): boolean {
  if (!prefix) return true

  const lowerPrefix = prefix.toLowerCase()

  // Apply special rules that can be checked on prefixes
  if (!applyValidationRules.qRequiresU(lowerPrefix)) return false

  // Check if any word in the dictionary starts with this prefix
  if (dictionaryTrie.startsWith(lowerPrefix)) return true

  // Check if any common word starts with this prefix
  for (const word of commonEnglishWords) {
    if (word.startsWith(lowerPrefix)) return true
  }

  return false
}

/**
 * Find all possible words that can be formed with given letters
 * @param letters Array of available letters
 * @returns Array of valid words that can be formed
 */
export function getPossibleWords(letters: string[]): string[] {
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

// Export for use in other modules
export { dictionary, dictionarySet, dictionaryTrie, getWordDifficulty }
