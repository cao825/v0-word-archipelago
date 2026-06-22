import {
  checkWordAgainstObjective,
  checkObjectives,
  generateObjectives,
  type Objective,
  type ObjectiveType,
} from "../lib/utils/objectiveGenerator"

describe("Objective System", () => {
  describe("checkWordAgainstObjective", () => {
    const createObjective = (type: ObjectiveType, parameter: string | number): Objective => ({
      id: `${type}-${parameter}`,
      type,
      description: `Test ${type} objective`,
      parameter,
      completed: false,
    })

    describe("length objective", () => {
      test("matches words of exact length", () => {
        const objective3 = createObjective("length", 3)
        const objective4 = createObjective("length", 4)
        const objective5 = createObjective("length", 5)

        // 3-letter words
        expect(checkWordAgainstObjective("cat", objective3)).toBe(true)
        expect(checkWordAgainstObjective("dog", objective3)).toBe(true)
        expect(checkWordAgainstObjective("his", objective3)).toBe(true)
        expect(checkWordAgainstObjective("hi", objective3)).toBe(false) // 2 letters, not 3

        // 4-letter words
        expect(checkWordAgainstObjective("test", objective4)).toBe(true)
        expect(checkWordAgainstObjective("word", objective4)).toBe(true)
        expect(checkWordAgainstObjective("toys", objective4)).toBe(true)
        expect(checkWordAgainstObjective("his", objective4)).toBe(false) // 3 letters, not 4

        // 5-letter words
        expect(checkWordAgainstObjective("hello", objective5)).toBe(true)
        expect(checkWordAgainstObjective("world", objective5)).toBe(true)
        expect(checkWordAgainstObjective("his", objective5)).toBe(false) // 3 letters, not 5
      })

      test("handles string parameters", () => {
        const objective = createObjective("length", "3")
        expect(checkWordAgainstObjective("cat", objective)).toBe(true)
        expect(checkWordAgainstObjective("his", objective)).toBe(true)
        expect(checkWordAgainstObjective("test", objective)).toBe(false)
      })

      test("handles invalid parameters", () => {
        const invalidObjective = createObjective("length", "not-a-number")
        expect(checkWordAgainstObjective("test", invalidObjective)).toBe(false)
        expect(checkWordAgainstObjective("his", invalidObjective)).toBe(false)
      })
    })

    describe("startsWith objective", () => {
      test("matches words starting with the parameter", () => {
        const objectiveH = createObjective("startsWith", "h")
        const objectiveT = createObjective("startsWith", "t")

        // Words starting with 'h'
        expect(checkWordAgainstObjective("his", objectiveH)).toBe(true)
        expect(checkWordAgainstObjective("hat", objectiveH)).toBe(true)
        expect(checkWordAgainstObjective("hello", objectiveH)).toBe(true)

        // Words starting with 't'
        expect(checkWordAgainstObjective("test", objectiveT)).toBe(true)
        expect(checkWordAgainstObjective("tie", objectiveT)).toBe(true)

        // Words not starting with 'h'
        expect(checkWordAgainstObjective("cat", objectiveH)).toBe(false)
        expect(checkWordAgainstObjective("this", objectiveH)).toBe(false) // 't' not 'h'
      })

      test("is case insensitive", () => {
        const objectiveH = createObjective("startsWith", "H")
        expect(checkWordAgainstObjective("his", objectiveH)).toBe(true)
        expect(checkWordAgainstObjective("HIS", objectiveH)).toBe(true)
        expect(checkWordAgainstObjective("Hat", objectiveH)).toBe(true)
      })
    })

    describe("endsWith objective", () => {
      test("matches words ending with the parameter", () => {
        const objectiveS = createObjective("endsWith", "s")
        const objectiveE = createObjective("endsWith", "e")

        // Words ending with 's'
        expect(checkWordAgainstObjective("his", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("toys", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("compass", objectiveS)).toBe(true)

        // Words ending with 'e'
        expect(checkWordAgainstObjective("time", objectiveE)).toBe(true)
        expect(checkWordAgainstObjective("bike", objectiveE)).toBe(true)

        // Words not ending with 's'
        expect(checkWordAgainstObjective("hi", objectiveS)).toBe(false)
        expect(checkWordAgainstObjective("sit", objectiveS)).toBe(false) // 't' not 's'
      })

      test("is case insensitive", () => {
        const objectiveS = createObjective("endsWith", "S")
        expect(checkWordAgainstObjective("his", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("HIS", objectiveS)).toBe(true)
        expect(checkWordAgainstObjective("toyS", objectiveS)).toBe(true)
      })
    })

    describe("contains objective", () => {
      test("matches words containing the parameter", () => {
        const objectiveI = createObjective("contains", "i")
        const objectiveO = createObjective("contains", "o")

        // Words containing 'i'
        expect(checkWordAgainstObjective("his", objectiveI)).toBe(true)
        expect(checkWordAgainstObjective("time", objectiveI)).toBe(true)
        expect(checkWordAgainstObjective("bike", objectiveI)).toBe(true)

        // Words containing 'o'
        expect(checkWordAgainstObjective("dog", objectiveO)).toBe(true)
        expect(checkWordAgainstObjective("toys", objectiveO)).toBe(true)

        // Words not containing 'i'
        expect(checkWordAgainstObjective("dog", objectiveI)).toBe(false)
        expect(checkWordAgainstObjective("cat", objectiveI)).toBe(false)
      })

      test("is case insensitive", () => {
        const objectiveI = createObjective("contains", "I")
        expect(checkWordAgainstObjective("his", objectiveI)).toBe(true)
        expect(checkWordAgainstObjective("HIS", objectiveI)).toBe(true)
        expect(checkWordAgainstObjective("tIme", objectiveI)).toBe(true)
      })
    })
  })

  describe("checkObjectives", () => {
    test("identifies completed objectives correctly", () => {
      const objectives: Objective[] = [
        {
          id: "length-3",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "startsWith-h",
          type: "startsWith",
          description: "Find a word starting with 'h'",
          parameter: "h",
          completed: false,
        },
        {
          id: "endsWith-s",
          type: "endsWith",
          description: "Find a word ending with 's'",
          parameter: "s",
          completed: false,
        },
      ]

      // Test with "hi" — completes only startsWith-h: "hi" starts with "h",
      // is 2 letters (not length-3), and ends with "i" (not endsWith-s).
      const completedWithHi = checkObjectives("hi", objectives, [])
      expect(completedWithHi).not.toContain("length-3")
      expect(completedWithHi).toContain("startsWith-h")
      expect(completedWithHi).not.toContain("endsWith-s")
      expect(completedWithHi.length).toBe(1)

      // Test with "his" - should complete length-3, startsWith-h and endsWith-s
      const completedWithHis = checkObjectives("his", objectives, [])
      expect(completedWithHis).toContain("length-3")
      expect(completedWithHis).toContain("startsWith-h")
      expect(completedWithHis).toContain("endsWith-s")
      expect(completedWithHis.length).toBe(3)

      // Test with "hat" - should complete length-3 and startsWith-h
      const completedWithHat = checkObjectives("hat", objectives, [])
      expect(completedWithHat).toContain("length-3")
      expect(completedWithHat).toContain("startsWith-h")
      expect(completedWithHat).not.toContain("endsWith-s")
      expect(completedWithHat.length).toBe(2)
    })

    test("skips already completed objectives", () => {
      const objectives: Objective[] = [
        {
          id: "length-3",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
        {
          id: "startsWith-h",
          type: "startsWith",
          description: "Find a word starting with 'h'",
          parameter: "h",
          completed: false,
        },
        {
          id: "endsWith-s",
          type: "endsWith",
          description: "Find a word ending with 's'",
          parameter: "s",
          completed: false,
        },
      ]

      // Mark some objectives as already completed
      const alreadyCompleted = ["length-3", "startsWith-h"]

      // Test with "his" - should only complete endsWith-s
      const completedWithHis = checkObjectives("his", objectives, alreadyCompleted)
      expect(completedWithHis).not.toContain("length-3")
      expect(completedWithHis).not.toContain("startsWith-h")
      expect(completedWithHis).toContain("endsWith-s")
      expect(completedWithHis.length).toBe(1)
    })

    test("handles empty or invalid inputs", () => {
      const objectives: Objective[] = [
        {
          id: "length-3",
          type: "length",
          description: "Find a word with 3 letters",
          parameter: 3,
          completed: false,
        },
      ]

      expect(checkObjectives("", objectives, [])).toEqual([])
      expect(checkObjectives("a", objectives, [])).toEqual([])
      expect(checkObjectives(null as any, objectives, [])).toEqual([])
      expect(checkObjectives(undefined as any, objectives, [])).toEqual([])
      expect(checkObjectives("test", [], [])).toEqual([])
      expect(checkObjectives("test", null as any, [])).toEqual([])
    })
  })

  describe("generateObjectives", () => {
    const createMockIslands = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        letter: String.fromCharCode(97 + i), // a, b, c, ...
        position: { x: 0, y: 0 },
        size: 40,
        connections: [],
      }))
    }

    test("generates exactly 3 unique objectives", () => {
      const mockIslands = createMockIslands(6)
      const mockSeed = jest.fn().mockReturnValue(0.5)
      const objectives = generateObjectives(mockSeed, mockIslands)

      expect(objectives.length).toBe(3)

      // Check for unique IDs and types
      const ids = objectives.map((obj) => obj.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })

    test("handles islands with no letters", () => {
      const invalidIslands = Array(5).fill({ id: "1", position: { x: 0, y: 0 }, size: 40, connections: [] })
      const mockSeed = jest.fn().mockReturnValue(0.5)
      const objectives = generateObjectives(mockSeed, invalidIslands)

      // Should still generate 3 objectives with fallbacks
      expect(objectives.length).toBe(3)
    })

    test("handles duplicate types with different parameters", () => {
      const mockIslands = createMockIslands(2) // Only 'a' and 'b'
      const seedValues = [0.1, 0.1, 0.5, 0.5, 0.9, 0.9] // Force some duplicate types
      let seedIndex = 0

      const mockSeed = jest.fn().mockImplementation(() => {
        const value = seedValues[seedIndex]
        seedIndex = (seedIndex + 1) % seedValues.length
        return value
      })

      const objectives = generateObjectives(mockSeed, mockIslands)

      // Should still generate 3 unique objectives by parameter
      expect(objectives.length).toBe(3)

      const keys = objectives.map((obj) => `${obj.type}-${obj.parameter}`)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(3)
    })

    test("special test for 'his' word with generated objectives", () => {
      // Create mock islands with letters h, i, s
      const mockIslands = [
        { id: "1", letter: "h", position: { x: 0, y: 0 }, size: 40, connections: [] },
        { id: "2", letter: "i", position: { x: 0, y: 0 }, size: 40, connections: [] },
        { id: "3", letter: "s", position: { x: 0, y: 0 }, size: 40, connections: [] },
      ]

      const mockSeed = jest
        .fn()
        .mockReturnValueOnce(0) // 1: select "length" — floor(0*4)=0 of [length,startsWith,endsWith,contains]
        .mockReturnValueOnce(0) // 2: length parameter -> 3
        .mockReturnValueOnce(0.25) // 3: select "startsWith" — floor(0.25*3)=0 of [startsWith,endsWith,contains]
        .mockReturnValueOnce(0) // 4: letter "h" — index 0 of [h,i,s]
        .mockReturnValueOnce(0) // 5: select "endsWith" — floor(0*2)=0 of [endsWith,contains]
        .mockReturnValueOnce(0.7) // 6: letter "s" — floor(0.7*3)=2 of [h,i,s]
        .mockReturnValue(0) // default for any further seed() calls

      const objectives = generateObjectives(mockSeed, mockIslands)

      // Should generate the specific objectives we want for testing "his"
      expect(objectives.length).toBe(3)
      expect(objectives.find((obj) => obj.type === "length" && obj.parameter === 3)).toBeTruthy()
      expect(objectives.find((obj) => obj.type === "startsWith" && obj.parameter === "h")).toBeTruthy()
      expect(objectives.find((obj) => obj.type === "endsWith" && obj.parameter === "s")).toBeTruthy()

      // Now check that "his" completes all three objectives
      const completedObjectives = checkObjectives("his", objectives, [])
      expect(completedObjectives.length).toBe(3)
    })
  })
})
