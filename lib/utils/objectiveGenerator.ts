// Helper function to check if a word is a palindrome
export function isPalindrome(word: string): boolean {
  if (!word || word.length < 3) return false
  const cleanWord = word.toLowerCase()
  const reversedWord = cleanWord.split("").reverse().join("")
  return cleanWord === reversedWord
}

// Helper function to check if a word has at least N vowels
export function hasAtLeastNVowels(word: string, n: number): boolean {
  const vowels = "aeiou"
  let vowelCount = 0
  for (const char of word.toLowerCase()) {
    if (vowels.includes(char)) {
      vowelCount++
    }
  }
  return vowelCount >= n
}

export interface Objective {
  id: string
  type: string
  description: string
  parameter: string | number
  completed: boolean
}

// Generate objectives based on the current islands and seed
export function generateObjectives(seed: () => number, islands: any[]): Objective[] {
  // Safety check to ensure islands is an array
  if (!islands || !Array.isArray(islands)) {
    console.error("Invalid islands data provided to generateObjectives:", islands)
    return [] // Return empty array to prevent errors
  }

  try {
    const objectives: Objective[] = []
    const usedTypes = new Set<string>()
    const usedParameters = new Set<string>()

    // Define objective types
    const objectiveTypes = [
      {
        type: "length",
        description: "Find a word with {parameter} letters",
        generateParameter: () => {
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
        generateParameter: () => {
          try {
            // Get all available letters from islands
            const availableLetters = islands.map((island) => island.letter?.toLowerCase() || "")
            // Filter out empty letters
            const validLetters = availableLetters.filter((letter) => letter)
            if (validLetters.length === 0) return "a" // Fallback
            // Choose a random letter from available letters
            const letterIndex = Math.floor(seed() * validLetters.length)
            return validLetters[letterIndex]
          } catch (error) {
            console.error("Error generating startsWith parameter:", error)
            return "a" // Fallback to a common letter
          }
        },
        checkCompletion: (word: string, parameter: string | number): boolean => {
          if (!parameter || typeof parameter !== "string") return false
          return word.toLowerCase().startsWith(parameter.toString().toLowerCase())
        },
      },
      {
        type: "endsWith",
        description: "Find a word ending with '{parameter}'",
        generateParameter: () => {
          try {
            // Get all available letters from islands
            const availableLetters = islands.map((island) => island.letter?.toLowerCase() || "")
            // Filter out empty letters
            const validLetters = availableLetters.filter((letter) => letter)
            if (validLetters.length === 0) return "a" // Fallback
            // Choose a random letter from available letters
            const letterIndex = Math.floor(seed() * validLetters.length)
            return validLetters[letterIndex]
          } catch (error) {
            console.error("Error generating endsWith parameter:", error)
            return "a" // Fallback to a common letter
          }
        },
        checkCompletion: (word: string, parameter: string | number): boolean => {
          if (!parameter || typeof parameter !== "string") return false
          return word.toLowerCase().endsWith(parameter.toString().toLowerCase())
        },
      },
      {
        type: "contains",
        description: "Find a word containing '{parameter}'",
        generateParameter: () => {
          try {
            // Get all available letters from islands
            const availableLetters = islands.map((island) => island.letter?.toLowerCase() || "")
            // Filter out empty letters
            const validLetters = availableLetters.filter((letter) => letter)
            if (validLetters.length === 0) return "a" // Fallback
            // Choose a random letter from available letters
            const letterIndex = Math.floor(seed() * validLetters.length)
            return validLetters[letterIndex]
          } catch (error) {
            console.error("Error generating contains parameter:", error)
            return "a" // Fallback to a common letter
          }
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
  } catch (error) {
    console.error("Error generating objectives:", error)
    return [] // Return empty array on error
  }
}

// Check if a word completes any objectives
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

    if (checkWordAgainstObjective(lowerWord, objective)) {
      newCompletedObjectives.push(objective.id)
    }
  })

  console.log(`[checkObjectives] Newly completed objectives:`, newCompletedObjectives)
  return newCompletedObjectives
}

// Check a word against a single objective
export function checkWordAgainstObjective(word: string, objective: Objective): boolean {
  switch (objective.type) {
    case "length":
      return word.length === Number(objective.parameter)
    case "startsWith":
      return typeof objective.parameter === "string" && word.startsWith(objective.parameter)
    case "endsWith":
      return typeof objective.parameter === "string" && word.endsWith(objective.parameter)
    case "contains":
      return typeof objective.parameter === "string" && word.includes(objective.parameter)
    case "palindrome":
      return isPalindrome(word)
    default:
      console.warn(`Unknown objective type: ${objective.type}`)
      return false
  }
}

// Export objective types for testing
export const objectiveTypes = ["length", "startsWith", "endsWith", "contains", "palindrome"]
