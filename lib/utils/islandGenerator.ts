import type { Island } from "../slices/gameSlice"

// Letters with their frequencies (roughly based on English letter frequency)
const letterFrequencies = {
  A: 8,
  B: 2,
  C: 3,
  D: 4,
  E: 12,
  F: 2,
  G: 2,
  H: 6,
  I: 7,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 7,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 6,
  T: 9,
  U: 3,
  V: 1,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
}

// Create a weighted array of letters based on frequencies
const weightedLetters: string[] = []
Object.entries(letterFrequencies).forEach(([letter, frequency]) => {
  for (let i = 0; i < frequency; i++) {
    weightedLetters.push(letter)
  }
})

export function generateIslands(seed: () => number): Island[] {
  // Determine number of islands (12-16)
  const numIslands = Math.floor(seed() * 5) + 12

  const islands: Island[] = []
  const boardSize = 600 // Size of the game board
  const minDistance = 70 // Slightly reduced minimum distance to accommodate more islands

  // Generate islands with positions
  for (let i = 0; i < numIslands; i++) {
    let validPosition = false
    let x, y

    // Try to find a valid position that's not too close to other islands
    let attempts = 0
    while (!validPosition && attempts < 100) {
      x = Math.floor(seed() * (boardSize - 100)) + 50
      y = Math.floor(seed() * (boardSize - 100)) + 50

      validPosition = true
      for (const island of islands) {
        const distance = Math.sqrt(Math.pow(x - island.position.x, 2) + Math.pow(y - island.position.y, 2))

        if (distance < minDistance) {
          validPosition = false
          break
        }
      }

      attempts++
    }

    // If we couldn't find a valid position after many attempts, adjust
    if (!validPosition) {
      x = Math.floor(seed() * boardSize)
      y = Math.floor(seed() * boardSize)
    }

    // Select a random letter with weighting
    const letterIndex = Math.floor(seed() * weightedLetters.length)
    const letter = weightedLetters[letterIndex]

    // Vary the size slightly for visual interest (slightly smaller to accommodate more islands)
    const size = Math.floor(seed() * 8) + 30

    islands.push({
      id: `island-${i}`,
      letter,
      position: { x, y },
      size,
      connections: [], // Will be filled in later
    })
  }

  // Track all connections to prevent duplicates
  const connectionSet = new Set<string>()

  // Create connections between islands
  for (let i = 0; i < islands.length; i++) {
    // Calculate distances to all other islands
    const distances = islands
      .filter((other) => other.id !== islands[i].id)
      .map((other) => ({
        id: other.id,
        distance: Math.sqrt(
          Math.pow(other.position.x - islands[i].position.x, 2) + Math.pow(other.position.y - islands[i].position.y, 2),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)

    // Connect to 2-4 closest islands
    const numConnections = Math.floor(seed() * 3) + 2 // 2-4 connections
    let connectionsAdded = 0
    let connectionIndex = 0

    // Try to add the requested number of connections
    while (connectionsAdded < numConnections && connectionIndex < distances.length) {
      const targetId = distances[connectionIndex].id

      // Create a unique key for this connection (sort IDs to ensure consistency)
      const connectionKey = [islands[i].id, targetId].sort().join("-")

      // Only add if this connection doesn't already exist
      if (!connectionSet.has(connectionKey)) {
        connectionSet.add(connectionKey)

        // Add to both islands' connection lists
        islands[i].connections.push(targetId)

        const targetIsland = islands.find((island) => island.id === targetId)
        if (targetIsland) {
          targetIsland.connections.push(islands[i].id)
        }

        connectionsAdded++
      }

      connectionIndex++
    }
  }

  // Ensure all islands have at least one connection
  for (const island of islands) {
    if (island.connections.length === 0) {
      // Find the closest island
      const distances = islands
        .filter((other) => other.id !== island.id)
        .map((other) => ({
          id: other.id,
          distance: Math.sqrt(
            Math.pow(other.position.x - island.position.x, 2) + Math.pow(other.position.y - island.position.y, 2),
          ),
        }))
        .sort((a, b) => a.distance - b.distance)

      if (distances.length > 0) {
        const targetId = distances[0].id

        // Create a unique key for this connection
        const connectionKey = [island.id, targetId].sort().join("-")

        // Only add if this connection doesn't already exist
        if (!connectionSet.has(connectionKey)) {
          connectionSet.add(connectionKey)

          // Add to both islands' connection lists
          island.connections.push(targetId)

          const targetIsland = islands.find((i) => i.id === targetId)
          if (targetIsland) {
            targetIsland.connections.push(island.id)
          }
        }
      }
    }
  }

  // ADDITIONAL VALIDATION: Remove any duplicate connections that might have slipped through
  for (const island of islands) {
    // Use a Set to ensure uniqueness
    const uniqueConnections = new Set(island.connections)
    island.connections = Array.from(uniqueConnections)
  }

  // Ensure Q islands have at least one U neighbor
  islands.forEach((island) => {
    if (island.letter === "Q") {
      // Check if this Q already has a U neighbor
      const hasUNeighbor = island.connections.some((connId) => {
        const connectedIsland = islands.find((i) => i.id === connId)
        return connectedIsland && connectedIsland.letter === "U"
      })

      // If no U neighbor, convert one of the connected islands to U
      if (!hasUNeighbor && island.connections.length > 0) {
        // Pick a random connected island to convert to U
        const randomConnectionIndex = Math.floor(seed() * island.connections.length)
        const targetId = island.connections[randomConnectionIndex]
        const targetIsland = islands.find((i) => i.id === targetId)

        if (targetIsland) {
          targetIsland.letter = "U"
        }
      }
    }
  })

  return islands
}
