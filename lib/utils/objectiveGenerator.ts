/**
 * Objective system for the Word Archipelago game
 * Handles generation, validation, and checking of game objectives
 */

/**
 * Represents a game objective that players need to complete
 */
export interface Objective {
  id: string
  type: ObjectiveType
  description: string
  parameter: string | number
  completed: boolean
}

/**
 * Valid objective types
 */
export type ObjectiveType = "length" | "startsWith" | "endsWith" | "contains" | "palindrome"

/**
 * Checks if a word is a palindrome (reads the same backward as forward)
 * @param word - The word to check
 * @returns True if the word is a palindrome, false otherwise
 */
export function isPalindrome(word: string): boolean {
  // Validate input
  if (!word || typeof word !== "string" || word.length < 3) return false

  // Normalize and check
  const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, "")
  const reversed = normalized.split("").reverse().join("")

  return normalized === reversed
}

/**
 * Checks if a word has at least N vowels
 * @param word - The word to check
 * @param n - The minimum number of vowels required
 * @returns True if the word has at least N vowels, false otherwise
 */
export function hasAtLeastNVowels(word: string, n: number): boolean {
  if (!word || typeof word !== "string") return false

  const vowels = "aeiou"
  const vowelCount = [...word.toLowerCase()].filter((char) => vowels.includes(char)).length

  return vowelCount >= n
}

/**
 * Generates objectives based on the current islands and seed
 * @param seed - Function that returns a random number between 0 and 1
 * @param islands - Array of island objects
 * @returns Array of objectives
 */
export function generateObjectives(seed: () => number, islands: any[]): Objective[] {
  // Safety check for islands
  if (!islands || !Array.isArray(islands)) {
    console.error("Invalid islands data provided to generateObjectives")
    return []
  }

  try {
    const objectives: Objective[] = []
    const usedTypes = new Set<string>()
    const usedParameters = new Set<string>()

    // Define objective types and their generation/validation logic
    const objectiveTypes = [
      {
        type: "length" as ObjectiveType,
        description: "Find a word with {parameter} letters",
        generateParameter: () => {
          const maxLength = Math.min(6, islands.length)
          return Math.floor(seed() * (maxLength - 2)) + 3 // 3 to maxLength letter words
        },
        checkCompletion: (word: string, parameter: string | number): boolean => {
          const targetLength = typeof parameter === "number" ? parameter : Number.parseInt(parameter as string, 10)
          if (isNaN(targetLength)) return false
          return word.length === targetLength
        },
      },
      {
        type: "startsWith" as ObjectiveType,
        description: "Find a word starting with '{parameter}'",
        generateParameter: () => {
          const availableLetters = islands
            .map((island) => island.letter?.toLowerCase() || "")
            .filter((letter) => letter)

          if (availableLetters.length === 0) return "a"
          return availableLetters[Math.floor(seed() * availableLetters.length)]
        },
        checkCompletion: (word: string, parameter: string | number): boolean => {
          if (!parameter || typeof parameter !== "string") return false
          return word.toLowerCase().startsWith(parameter.toString().toLowerCase())
        },
      },
      {
        type: "endsWith" as ObjectiveType,
        description: "Find a word ending with '{parameter}'",
        generateParameter: () => {
          const availableLetters = islands
            .map((island) => island.letter?.toLowerCase() || "")
            .filter((letter) => letter)

          if (availableLetters.length === 0) return "a"
          return availableLetters[Math.floor(seed() * availableLetters.length)]
        },
        checkCompletion: (word: string, parameter: string | number): boolean => {
          if (!parameter || typeof parameter !== "string") return false
          return word.toLowerCase().endsWith(parameter.toString().toLowerCase())
        },
      },
      {
        type: "contains" as ObjectiveType,
        description: "Find a word containing '{parameter}'",
        generateParameter: () => {
          const availableLetters = islands
            .map((island) => island.letter?.toLowerCase() || "")
            .filter((letter) => letter)

          if (availableLetters.length === 0) return "a"
          return availableLetters[Math.floor(seed() * availableLetters.length)]
        },
        checkCompletion: (word: string, parameter: string | number): boolean => {
          if (!parameter || typeof parameter !== "string") return false
          return word.toLowerCase().includes(parameter.toString().toLowerCase())
        },
      },
      {
        type: "palindrome" as ObjectiveType,
        description: "Find a palindrome (reads the same forwards and backwards)",
        generateParameter: () => "palindrome",
        checkCompletion: (word: string): boolean => {
          return isPalindrome(word)
        },
      },
    ]

    // Generate 3 unique objectives
    while (objectives.length < 3 && usedTypes.size < objectiveTypes.length) {
      const typeIndex = Math.floor(seed() * objectiveTypes.length)
      const objectiveType = objectiveTypes[typeIndex]

      // Skip if we've already used this type
      if (usedTypes.has(objectiveType.type)) continue

      // Generate parameter for this objective type
      const parameter = objectiveType.generateParameter()
      const uniqueKey = `${objectiveType.type}-${parameter}`

      // Ensure we don't duplicate objective types or parameters
      if (!usedParameters.has(uniqueKey)) {
        usedTypes.add(objectiveType.type)
        usedParameters.add(uniqueKey)

        const description = objectiveType.description.replace("{parameter}", parameter.toString())

        objectives.push({
          id: `objective-${objectives.length}`,
          type: objectiveType.type,
          description,
          parameter,
          completed: false,
        })
      }
    }

    // If we couldn't generate 3 unique objectives, fill with fallbacks
    if (objectives.length < 3) {
      const fallbackLengths = [3, 4, 5, 6]

      for (let i = objectives.length; i < 3; i++) {
        // Use length objectives as fallbacks with different lengths
        for (const length of fallbackLengths) {
          const uniqueKey = `length-${length}`
          if (!usedParameters.has(uniqueKey)) {
            usedParameters.add(uniqueKey)
            objectives.push({
              id: `objective-${i}`,
              type: "length",
              description: `Find a word with ${length} letters`,
              parameter: length,
              completed: false,
            })
            break
          }
        }
      }
    }

    return objectives
  } catch (error) {
    console.error("Error generating objectives:", error)
    return []
  }
}

/**
 * Checks if a word completes any objectives
 * @param word - The word to check
 * @param objectives - Array of objectives to check against
 * @param completedObjectives - Array of already completed objective IDs
 * @returns Array of newly completed objective IDs
 */
export function checkObjectives(word: string, objectives: Objective[], completedObjectives: string[]): string[] {
  if (!word || typeof word !== "string" || word.length < 2) {
    return []
  }

  const newCompletedObjectives: string[] = []
  const lowerWord = word.toLowerCase()

  objectives.forEach((objective) => {
    // Skip already completed objectives
    if (objective.completed || completedObjectives.includes(objective.id)) {
      return
    }

    if (checkWordAgainstObjective(lowerWord, objective)) {
      newCompletedObjectives.push(objective.id)
    }
  })

  return newCompletedObjectives
}

/**
 * Checks if a word completes a specific objective
 * @param word - The word to check
 * @param objective - The objective to check against
 * @returns True if the word completes the objective, false otherwise
 */
export function checkWordAgainstObjective(word: string, objective: Objective): boolean {
  // Validate inputs
  if (!word || !objective) {
    return false
  }

  // Normalize the word
  const normalizedWord = word.toLowerCase().trim()

  switch (objective.type) {
    case "length": {
      const targetLength =
        typeof objective.parameter === "number" ? objective.parameter : Number.parseInt(String(objective.parameter), 10)

      if (isNaN(targetLength)) return false
      return normalizedWord.length === targetLength
    }
    case "startsWith":
      if (!objective.parameter || typeof objective.parameter !== "string") return false
      return normalizedWord.startsWith(objective.parameter.toLowerCase())
    case "endsWith":
      if (!objective.parameter || typeof objective.parameter !== "string") return false
      return normalizedWord.endsWith(objective.parameter.toLowerCase())
    case "contains":
      if (!objective.parameter || typeof objective.parameter !== "string") return false
      return normalizedWord.includes(objective.parameter.toLowerCase())
    case "palindrome":
      return isPalindrome(normalizedWord)
    default:
      return false
  }
}

// Export objective types for testing
export const objectiveTypes: ObjectiveType[] = ["length", "startsWith", "endsWith", "contains", "palindrome"]
