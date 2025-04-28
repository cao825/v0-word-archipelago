// Main dictionary file that combines all word categories
import { basicWords } from "./basic-words"
import { commonWords } from "./common-words"
import { longerWords } from "./longer-words"
import { animalWords } from "./categories/animals"
import { householdWords } from "./categories/household"
import { natureWords } from "./categories/nature"
import { foodWords } from "./categories/food"
import { verbWords } from "./categories/verbs"
import { adjectiveWords } from "./categories/adjectives"

// Combine all word lists into a single dictionary
export const dictionary = [
  ...basicWords,
  ...commonWords,
  ...longerWords,
  ...animalWords,
  ...householdWords,
  ...natureWords,
  ...foodWords,
  ...verbWords,
  ...adjectiveWords,
]

// Export individual categories for potential use in themed games
export {
  basicWords,
  commonWords,
  longerWords,
  animalWords,
  householdWords,
  natureWords,
  foodWords,
  verbWords,
  adjectiveWords,
}
