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
 * Valid objective types - simplified to make more reliable
 */
export type ObjectiveType = "length" | "startsWith" | "endsWith" | "contains"

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
 * Checks if a word completes a specific objective
 * @param word - The word to check
 * @param objective - The objective to check against
 * @returns True if the word completes the objective, false otherwise
 */
export function checkWordAgainstObjective(word: string, objective: Objective): boolean {
  // Validate inputs
  if (!word || typeof word !== "string") {
    console.debug("[checkWordAgainstObjective] Invalid word:", word)
    return false
  }

  if (!objective || typeof objective !== "object") {
    console.debug("[checkWordAgainstObjective] Invalid objective:", objective)
    return false
  }

  // Normalize the word
  const normalizedWord = word.toLowerCase().trim()

  // Debug logging for troubleshooting
  console.debug(
    `[checkWordAgainstObjective] Checking "${normalizedWord}" against ${objective.type}:${objective.parameter}`,
  )

  try {
    switch (objective.type) {
      case "length": {
        const targetLength =
          typeof objective.parameter === "number"
            ? objective.parameter
            : Number.parseInt(String(objective.parameter), 10)

        if (isNaN(targetLength)) {
          console.debug(`[length] Invalid target length: ${objective.parameter}`)
          return false
        }

        const result = normalizedWord.length === targetLength
        console.debug(`[length] ${normalizedWord}.length(${normalizedWord.length}) === ${targetLength}: ${result}`)
        return result
      }
      case "startsWith": {
        if (!objective.parameter || typeof objective.parameter !== "string") {
          console.debug(`[startsWith] Invalid parameter: ${objective.parameter}`)
          return false
        }

        const param = objective.parameter.toLowerCase().trim()
        if (!param) {
          console.debug(`[startsWith] Empty parameter after normalization`)
          return false
        }

        const result = normalizedWord.startsWith(param)
        console.debug(`[startsWith] ${normalizedWord}.startsWith(${param}): ${result}`)
        return result
      }
      case "endsWith": {
        if (!objective.parameter || typeof objective.parameter !== "string") {
          console.debug(`[endsWith] Invalid parameter: ${objective.parameter}`)
          return false
        }

        const param = objective.parameter.toLowerCase().trim()
        if (!param) {
          console.debug(`[endsWith] Empty parameter after normalization`)
          return false
        }

        const result = normalizedWord.endsWith(param)
        console.debug(`[endsWith] ${normalizedWord}.endsWith(${param}): ${result}`)
        return result
      }
      case "contains": {
        if (!objective.parameter || typeof objective.parameter !== "string") {
          console.debug(`[contains] Invalid parameter: ${objective.parameter}`)
          return false
        }

        const param = objective.parameter.toLowerCase().trim()
        if (!param) {
          console.debug(`[contains] Empty parameter after normalization`)
          return false
        }

        const result = normalizedWord.includes(param)
        console.debug(`[contains] ${normalizedWord}.includes(${param}): ${result}`)
        return result
      }
      default:
        console.warn(`Unknown objective type: ${objective.type}`)
        return false
    }
  } catch (error) {
    console.error(`[checkWordAgainstObjective] Error checking ${objective.type} objective:`, error)
    return false
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
  // Validate inputs
  if (!word || typeof word !== "string" || word.length < 2) {
    console.debug("[checkObjectives] Invalid word or too short:", word)
    return []
  }

  if (!objectives || !Array.isArray(objectives) || objectives.length === 0) {
    console.debug("[checkObjectives] No objectives to check against")
    return []
  }

  if (!completedObjectives || !Array.isArray(completedObjectives)) {
    console.debug("[checkObjectives] Invalid completedObjectives array")
    completedObjectives = []
  }

  const newCompletedObjectives: string[] = []
  const lowerWord = word.toLowerCase().trim()

  // Debug log the word being checked
  console.debug(`[checkObjectives] Checking word "${lowerWord}" against ${objectives.length} objectives`)

  objectives.forEach((objective) => {
    // Skip already completed objectives
    if (objective.completed || completedObjectives.includes(objective.id)) {
      console.debug(`[checkObjectives] Skipping already completed objective: ${objective.id}`)
      return
    }

    // Validate the objective has required properties
    if (!objective.type || !objective.id) {
      console.debug(`[checkObjectives] Invalid objective:`, objective)
      return
    }

    try {
      const completed = checkWordAgainstObjective(lowerWord, objective)

      // Debug logging for troubleshooting
      console.debug(
        `[checkObjectives] Word "${lowerWord}" against objective ${objective.id} (${objective.type}:${objective.parameter}): ${completed ? "COMPLETED" : "not completed"}`,
      )

      if (completed) {
        newCompletedObjectives.push(objective.id)
      }
    } catch (error) {
      console.error(`[checkObjectives] Error checking objective ${objective.id}:`, error)
    }
  })

  // Log the results
  if (newCompletedObjectives.length > 0) {
    console.debug(`[checkObjectives] Word "${lowerWord}" completed objectives:`, newCompletedObjectives)
  } else {
    console.debug(`[checkObjectives] Word "${lowerWord}" completed no objectives`)
  }

  return newCompletedObjectives
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
    ]

    // Generate 3 unique objectives
    const maxAttempts = 20 // Prevent infinite loops
    let attempts = 0

    while (objectives.length < 3 && attempts < maxAttempts) {
      attempts++

      // Select a random objective type that hasn't been used yet
      const availableTypes = objectiveTypes.filter((type) => !usedTypes.has(type.type))

      // If we've used all types, break to use fallbacks
      if (availableTypes.length === 0) break

      const typeIndex = Math.floor(seed() * availableTypes.length)
      const objectiveType = availableTypes[typeIndex]

      // Generate parameter for this objective type
      let parameter = objectiveType.generateParameter()
      let uniqueKey = `${objectiveType.type}-${parameter}`

      // Try up to 5 times to get a unique parameter for this type
      let paramAttempts = 0
      while (usedParameters.has(uniqueKey) && paramAttempts < 5) {
        paramAttempts++
        parameter = objectiveType.generateParameter()
        uniqueKey = `${objectiveType.type}-${parameter}`
      }

      // If we found a unique parameter, add the objective
      if (!usedParameters.has(uniqueKey)) {
        usedTypes.add(objectiveType.type)
        usedParameters.add(uniqueKey)

        const description = objectiveType.description.replace("{parameter}", parameter.toString())

        // Generate a unique ID that includes the type and parameter
        const id = `${objectiveType.type}-${parameter}`

        objectives.push({
          id,
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
              id: `length-${length}`,
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

    // Final check for duplicates
    const uniqueObjectives = objectives.filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))

    return uniqueObjectives.slice(0, 3) // Ensure we return exactly 3 objectives
  } catch (error) {
    console.error("Error generating objectives:", error)
    return []
  }
}

// Export objective types for testing
export const objectiveTypes: ObjectiveType[] = ["length", "startsWith", "endsWith", "contains"]
