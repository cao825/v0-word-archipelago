import type { Objective, Island } from "../slices/gameSlice"

const objectiveTypes = [
  {
    type: "length",
    description: "Find a word with {parameter} letters",
    generateParameter: (seed: () => number, islands: Island[]): number => {
      // Generate a length between 3-6 letters, but no longer than the number of islands
      const maxLength = Math.min(6, islands.length)
      return Math.floor(seed() * (maxLength - 2)) + 3 // 3 to maxLength letter words
    },
    checkCompletion: (word: string, parameter: string | number): boolean => {
      const targetLength = Number(parameter)
      return word.length === targetLength
    },
  },
  {
    type: "startsWith",
    description: "Find a word starting with '{parameter}'",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Get all available letters from islands
      const availableLetters = islands.map((island) => island.letter.toLowerCase())
      // Choose a random letter from available letters
      const letterIndex = Math.floor(seed() * availableLetters.length)
      return availableLetters[letterIndex]
    },
    checkCompletion: (word: string, parameter: string | number): boolean => {
      if (!parameter || typeof parameter !== "string") return false
      return word.toLowerCase().startsWith(parameter.toString().toLowerCase())
    },
  },
  {
    type: "endsWith",
    description: "Find a word ending with '{parameter}'",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Get all available letters from islands
      const availableLetters = islands.map((island) => island.letter.toLowerCase())
      // Choose a random letter from available letters
      const letterIndex = Math.floor(seed() * availableLetters.length)
      return availableLetters[letterIndex]
    },
    checkCompletion: (word: string, parameter: string | number): boolean => {
      if (!parameter || typeof parameter !== "string") return false
      return word.toLowerCase().endsWith(parameter.toString().toLowerCase())
    },
  },
  {
    type: "contains",
    description: "Find a word containing '{parameter}'",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Get all available letters from islands
      const availableLetters = islands.map((island) => island.letter.toLowerCase())
      // Choose a random letter from available letters
      const letterIndex = Math.floor(seed() * availableLetters.length)
      return availableLetters[letterIndex]
    },
    checkCompletion: (word: string, parameter: string | number): boolean => {
      if (!parameter || typeof parameter !== "string") return false
      return word.toLowerCase().includes(parameter.toString().toLowerCase())
    },
  },
  {
    type: "palindrome",
    description: "Find a palindrome (reads the same forwards and backwards)",
    generateParameter: () => "palindrome",
    checkCompletion: (word: string): boolean => {
      if (word.length < 3) return false // Palindromes should be at least 3 letters
      const reversed = word.toLowerCase().split("").reverse().join("")
      return word.toLowerCase() === reversed
    },
  },
]

export function generateObjectives(seed: () => number, islands: Island[]): Objective[] {
  const objectives: Objective[] = []
  const usedTypes = new Set<string>()
  const usedParameters = new Set<string>()

  // Generate 3 unique objectives
  while (objectives.length < 3 && usedTypes.size < objectiveTypes.length) {
    const typeIndex = Math.floor(seed() * objectiveTypes.length)
    const objectiveType = objectiveTypes[typeIndex]

    // Skip if we've already used this type
    if (usedTypes.has(objectiveType.type)) continue

    // Generate parameter for this objective type
    const parameter = objectiveType.generateParameter(seed, islands)

    // Create a unique key combining type and parameter to ensure truly unique objectives
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
}

export function checkObjectives(word: string, objectives: Objective[], completedObjectives: string[]): string[] {
  if (!word || typeof word !== "string" || word.length < 2) {
    console.log("Invalid word provided to checkObjectives:", word)
    return []
  }

  const newCompletedObjectives: string[] = []
  const lowerWord = word.toLowerCase()

  console.log(`[checkObjectives] Checking word "${lowerWord}" against objectives:`, JSON.stringify(objectives, null, 2))
  console.log(`[checkObjectives] Already completed objectives:`, completedObjectives)

  objectives.forEach((objective) => {
    // Skip already completed objectives
    if (objective.completed || completedObjectives.includes(objective.id)) {
      console.log(`[checkObjectives] Objective ${objective.id} already completed, skipping`)
      return
    }

    // Find the objective type definition
    const objectiveType = objectiveTypes.find((type) => type.type === objective.type)
    if (!objectiveType) {
      console.error(`[checkObjectives] Unknown objective type: ${objective.type}`)
      return
    }

    try {
      // Use the type-specific check function
      const completed = objectiveType.checkCompletion(lowerWord, objective.parameter)

      console.log(
        `[checkObjectives] Objective ${objective.id} (${objective.type}): ${completed ? "COMPLETED" : "not completed"} - Parameter: ${objective.parameter}, Word: ${lowerWord}`,
      )

      if (completed) {
        newCompletedObjectives.push(objective.id)
      }
    } catch (error) {
      console.error(`[checkObjectives] Error checking objective ${objective.id}:`, error)
    }
  })

  console.log(`[checkObjectives] Newly completed objectives:`, newCompletedObjectives)
  return newCompletedObjectives
}

// Export objective types for testing
export { objectiveTypes }
