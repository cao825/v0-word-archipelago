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

// Let's add some debug logging to help identify the issue
export function checkObjectives(word: string, objectives: Objective[], completedObjectives: string[]): string[] {
  const newCompletedObjectives: string[] = []
  const lowerWord = word.toLowerCase()

  console.log(`Checking word "${lowerWord}" against objectives:`, objectives)
  console.log(`Already completed objectives:`, completedObjectives)

  objectives.forEach((objective) => {
    // Skip already completed objectives
    if (completedObjectives.includes(objective.id)) {
      return
    }

    let completed = false
    let reason = ""

    switch (objective.type) {
      case "length":
        // Ensure we're comparing numbers to handle both string and number parameter types
        const targetLength = Number.parseInt(objective.parameter.toString(), 10)
        completed = lowerWord.length === targetLength
        reason = `Word length ${lowerWord.length}, target ${targetLength}`
        break
      case "startsWith":
        const targetStart = objective.parameter.toString().toLowerCase()
        completed = lowerWord.startsWith(targetStart)
        reason = `Word starts with "${lowerWord[0]}", target "${targetStart}"`
        break
      case "endsWith":
        const targetEnd = objective.parameter.toString().toLowerCase()
        completed = lowerWord.endsWith(targetEnd)
        reason = `Word ends with "${lowerWord[lowerWord.length - 1]}", target "${targetEnd}"`
        break
      case "contains":
        const targetChar = objective.parameter.toString().toLowerCase()
        completed = lowerWord.includes(targetChar)
        reason = `Word contains chars "${[...new Set(lowerWord.split(""))].join("")}", target "${targetChar}"`
        break
      case "palindrome":
        const reversed = lowerWord.split("").reverse().join("")
        completed = lowerWord === reversed && lowerWord.length > 1
        reason = `Word "${lowerWord}" reversed is "${reversed}"`
        break
    }

    console.log(
      `Objective ${objective.id} (${objective.type}): ${completed ? "COMPLETED" : "not completed"} - ${reason}`,
    )

    if (completed) {
      newCompletedObjectives.push(objective.id)
    }
  })

  console.log(`Newly completed objectives:`, newCompletedObjectives)
  return newCompletedObjectives
}
