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
import { technologyWords } from "./categories/technology"
import { sportsWords } from "./categories/sports"
import { artsWords } from "./categories/arts"
import { scienceWords } from "./categories/science"
import { transportWords } from "./categories/transport"
import { fashionWords } from "./categories/fashion"
import { colorWords } from "./categories/colors"
import { emotionWords } from "./categories/emotions"
import { bodyWords } from "./categories/body"
import { timeWords } from "./categories/time"
import { comparativeWords } from "./categories/comparatives"

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
  ...technologyWords,
  ...sportsWords,
  ...artsWords,
  ...scienceWords,
  ...transportWords,
  ...fashionWords,
  ...colorWords,
  ...emotionWords,
  ...bodyWords,
  ...timeWords,
  ...comparativeWords,
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
  technologyWords,
  sportsWords,
  artsWords,
  scienceWords,
  transportWords,
  fashionWords,
  colorWords,
  emotionWords,
  bodyWords,
  timeWords,
  comparativeWords,
}
