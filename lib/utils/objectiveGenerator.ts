import type { Objective, Island } from "../slices/gameSlice"

const objectiveTypes = [
  {
    type: "length",
    description: "Find a word with {parameter} letters",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Generate a length between 3-6 letters, but no longer than the number of islands
      const maxLength = Math.min(6, islands.length)
      return Math.floor(seed() * (maxLength - 2)) + 3 // 3 to maxLength letter words
    },
  },
  {
    type: "startsWith",
    description: "Find a word starting with '{parameter}'",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Get all available letters from islands
      const availableLetters = islands.map((island) => island.letter)
      // Choose a random letter from available letters
      const letterIndex = Math.floor(seed() * availableLetters.length)
      return availableLetters[letterIndex]
    },
  },
  {
    type: "endsWith",
    description: "Find a word ending with '{parameter}'",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Get all available letters from islands
      const availableLetters = islands.map((island) => island.letter)
      // Choose a random letter from available letters
      const letterIndex = Math.floor(seed() * availableLetters.length)
      return availableLetters[letterIndex]
    },
  },
  {
    type: "contains",
    description: "Find a word containing '{parameter}'",
    generateParameter: (seed: () => number, islands: Island[]) => {
      // Get all available letters from islands
      const availableLetters = islands.map((island) => island.letter)
      // Choose a random letter from available letters
      const letterIndex = Math.floor(seed() * availableLetters.length)
      return availableLetters[letterIndex]
    },
  },
  {
    type: "palindrome",
    description: "Find a palindrome (reads the same forwards and backwards)",
    generateParameter: () => "palindrome",
  },
]

export function generateObjectives(seed: () => number, islands: Island[]): Objective[] {
  const objectives: Objective[] = []
  const usedTypes = new Set<string>()

  // Generate 3 unique objectives
  while (objectives.length < 3) {
    const typeIndex = Math.floor(seed() * objectiveTypes.length)
    const objectiveType = objectiveTypes[typeIndex]

    // Ensure we don't duplicate objective types
    if (!usedTypes.has(objectiveType.type)) {
      usedTypes.add(objectiveType.type)

      const parameter = objectiveType.generateParameter(seed, islands)
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

  return objectives
}

export function checkObjectives(word: string, objectives: Objective[], completedObjectives: string[]): string[] {
  const newCompletedObjectives: string[] = []

  objectives.forEach((objective) => {
    // Skip already completed objectives
    if (completedObjectives.includes(objective.id)) {
      return
    }

    let completed = false

    switch (objective.type) {
      case "length":
        completed = word.length === Number(objective.parameter)
        break
      case "startsWith":
        completed = word.toUpperCase().startsWith(objective.parameter.toString())
        break
      case "endsWith":
        completed = word.toUpperCase().endsWith(objective.parameter.toString())
        break
      case "contains":
        completed = word.toUpperCase().includes(objective.parameter.toString())
        break
      case "palindrome":
        const reversed = word.split("").reverse().join("")
        completed = word.toLowerCase() === reversed.toLowerCase() && word.length > 1
        break
    }

    if (completed) {
      newCompletedObjectives.push(objective.id)
    }
  })

  return newCompletedObjectives
}
