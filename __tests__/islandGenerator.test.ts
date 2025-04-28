import { generateIslands } from "../lib/utils/islandGenerator"

describe("Island Generator", () => {
  // Mock seed function that returns predictable values
  const mockSeed = jest
    .fn()
    .mockReturnValueOnce(0.5) // For number of islands
    .mockReturnValueOnce(0.3) // For x position
    .mockReturnValueOnce(0.7) // For y position
    .mockReturnValueOnce(0.2) // For letter selection
    .mockReturnValueOnce(0.6) // For size
    .mockReturnValueOnce(0.4) // For number of connections
    .mockReturnValue(0.5) // Default for remaining calls

  it("should generate islands with the correct structure", () => {
    const islands = generateIslands(mockSeed)

    // Check we have islands
    expect(islands.length).toBeGreaterThan(0)

    // Check island structure
    const island = islands[0]
    expect(island).toHaveProperty("id")
    expect(island).toHaveProperty("letter")
    expect(island).toHaveProperty("position")
    expect(island.position).toHaveProperty("x")
    expect(island.position).toHaveProperty("y")
    expect(island).toHaveProperty("size")
    expect(island).toHaveProperty("connections")
    expect(Array.isArray(island.connections)).toBe(true)
  })

  it("should ensure all islands have at least one connection", () => {
    const islands = generateIslands(mockSeed)

    // Check each island has at least one connection
    islands.forEach((island) => {
      expect(island.connections.length).toBeGreaterThan(0)
    })
  })

  it("should ensure Q islands have at least one U neighbor", () => {
    // Create a seed function that will generate a Q island
    const qSeed = jest.fn().mockImplementation(() => {
      // This implementation will ensure we get a Q island
      // by returning specific values for the first island
      qSeed.mock.calls.length === 1
        ? 0.5
        : // Number of islands
          qSeed.mock.calls.length === 2
          ? 0.3
          : // X position
            qSeed.mock.calls.length === 3
            ? 0.7
            : // Y position
              qSeed.mock.calls.length === 4
              ? 0.01
              : // Letter selection (Q is low frequency)
                qSeed.mock.calls.length === 5
                ? 0.6
                : // Size
                  qSeed.mock.calls.length === 6
                  ? 0.4
                  : // Number of connections
                    0.5 // Default for remaining calls
    })

    // Force a Q island by directly modifying the first island
    const islands = generateIslands(qSeed)
    if (islands.length > 0) {
      islands[0].letter = "Q"

      // Check if Q has a U neighbor
      const qIsland = islands.find((island) => island.letter === "Q")
      if (qIsland) {
        const hasUNeighbor = qIsland.connections.some((connId) => {
          const connectedIsland = islands.find((i) => i.id === connId)
          return connectedIsland && connectedIsland.letter === "U"
        })

        expect(hasUNeighbor).toBe(true)
      }
    }
  })

  it("should not have duplicate connections", () => {
    const islands = generateIslands(mockSeed)

    // Check for duplicate connections
    islands.forEach((island) => {
      const uniqueConnections = new Set(island.connections)
      expect(uniqueConnections.size).toBe(island.connections.length)
    })
  })

  it("should ensure connections are bidirectional", () => {
    const islands = generateIslands(mockSeed)

    // Check that if A is connected to B, then B is connected to A
    islands.forEach((islandA) => {
      islandA.connections.forEach((connId) => {
        const islandB = islands.find((i) => i.id === connId)
        expect(islandB?.connections.includes(islandA.id)).toBe(true)
      })
    })
  })
})
