import { generateIslands } from "../lib/utils/islandGenerator"
import { seedRandom } from "../lib/utils/seedRandom"

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
    // Generate many DETERMINISTIC boards via the real seeded RNG and assert the
    // generator's invariant: every Q island it produces has at least one
    // connected "U" island. (The previous test fed an undefined-returning mock
    // seed and force-set a letter to "Q" AFTER generation — which both crashed
    // and bypassed the guarantee logic this test exists to verify.)
    let qIslandsChecked = 0

    for (let i = 0; i < 60; i++) {
      const islands = generateIslands(seedRandom(`q-u-board-${i}`))

      for (const qIsland of islands.filter((island) => island.letter === "Q")) {
        qIslandsChecked++
        const hasUNeighbor = qIsland.connections.some((connId) => {
          const connectedIsland = islands.find((island) => island.id === connId)
          return connectedIsland?.letter === "U"
        })

        expect(hasUNeighbor).toBe(true)
      }
    }

    // Guard against a vacuous pass: confirm the invariant was actually exercised
    // (i.e. these deterministic seeds really do produce at least one Q island).
    expect(qIslandsChecked).toBeGreaterThan(0)
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
