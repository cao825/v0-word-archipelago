"use client"

import type React from "react"
import { useRef, useEffect, useState, useMemo } from "react"
import type { Island } from "../lib/slices/gameSlice"

interface IslandMapProps {
  islands: Island[]
  selectedIslands: string[]
  onIslandClick: (id: string) => void
}

// Interface for storing island shapes
interface IslandShape {
  points: { x: number; y: number }[]
  beachPoints: { x: number; y: number }[]
  palmTrees: { x: number; y: number; size: number; lean: number }[]
}

export default function IslandMap({ islands, selectedIslands, onIslandClick }: IslandMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [debug, setDebug] = useState(false)
  const [time, setTime] = useState(0)

  // Animation timer for water movement
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => (prev + 1) % 1000)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Generate and memoize island shapes so they don't change on re-render
  const islandShapes = useMemo(() => {
    const shapes: Record<string, IslandShape> = {}

    islands.forEach((island) => {
      // Use different number of points for each island (10-16)
      const idSum = island.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
      const numPoints = 10 + (idSum % 7) // 10-16 points

      // Reduced irregularity for smoother shapes
      const irregularity = 0.15 + (idSum % 10) / 50 // 0.15-0.35 irregularity

      const points: { x: number; y: number }[] = []
      const beachPoints: { x: number; y: number }[] = []

      // Generate points for the island shape
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2

        // Create a unique seed for each point based on island ID and point index
        const seed1 = (idSum * (i + 1)) % 100
        const seed2 = (idSum * (i + 2)) % 100

        // Simplified formula for more subtle variations
        const randomFactor = 1 - irregularity + (Math.sin(seed1 + seed2) * 0.5 + 0.5) * irregularity

        // Main island shape (slightly smaller to make room for beach)
        const radius = island.size * 0.85 * randomFactor
        points.push({
          x: island.position.x + Math.cos(angle) * radius,
          y: island.position.y + Math.sin(angle) * radius,
        })

        // Beach shape (slightly larger than island)
        const beachRadius = island.size * randomFactor
        beachPoints.push({
          x: island.position.x + Math.cos(angle) * beachRadius,
          y: island.position.y + Math.sin(angle) * beachRadius,
        })
      }

      // Generate palm trees
      const numTrees = 1 + (idSum % 3) // 1-3 palm trees per island
      const palmTrees: { x: number; y: number; size: number; lean: number }[] = []

      for (let i = 0; i < numTrees; i++) {
        const seed = (idSum * (i + 1)) % 100
        const angle = (seed / 100) * Math.PI * 2

        // Place trees near the edge of the island
        const distance = island.size * 0.6
        const treeX = island.position.x + Math.cos(angle) * distance
        const treeY = island.position.y + Math.sin(angle) * distance

        // Vary tree size and lean
        const treeSize = island.size * (0.2 + (seed % 10) / 50) // 0.2-0.4 of island size
        const treeLean = (seed % 10) / 10 - 0.5 // -0.5 to 0.5 lean factor

        palmTrees.push({
          x: treeX,
          y: treeY,
          size: treeSize,
          lean: treeLean,
        })
      }

      shapes[island.id] = { points, beachPoints, palmTrees }
    })

    return shapes
  }, [islands])

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const { width, height } = container.getBoundingClientRect()

      // Set canvas size to match container while maintaining aspect ratio
      canvas.width = 600
      canvas.height = 600

      // Calculate scale for click handling
      const scaleX = width / 600
      const scaleY = height / 600
      setScale(Math.min(scaleX, scaleY))
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw tropical ocean background
    const oceanGradient = ctx.createRadialGradient(300, 300, 0, 300, 300, 400)
    oceanGradient.addColorStop(0, "#0891b2") // Cyan-600
    oceanGradient.addColorStop(0.7, "#0e7490") // Cyan-700
    oceanGradient.addColorStop(1, "#155e75") // Cyan-800
    ctx.fillStyle = oceanGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw animated wave pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1.5

    // Draw wavy lines for ocean effect with animation
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 5) {
        const waveHeight = 4
        // Use time to animate the waves
        const waveY = y + Math.sin(x / 30 + time / 5) * waveHeight
        if (x === 0) {
          ctx.moveTo(x, waveY)
        } else {
          ctx.lineTo(x, waveY)
        }
      }
      ctx.stroke()
    }

    // Create a set to track rendered connections
    const renderedConnections = new Set<string>()

    // Draw connections
    islands.forEach((island) => {
      island.connections.forEach((connectedId) => {
        // Create a unique key for this connection (sort IDs to ensure consistency)
        const connectionKey = [island.id, connectedId].sort().join("-")

        // Only render if we haven't already rendered this connection
        if (!renderedConnections.has(connectionKey)) {
          renderedConnections.add(connectionKey)

          const connectedIsland = islands.find((i) => i.id === connectedId)
          if (connectedIsland) {
            // Check if this connection is part of the selected path
            const islandIndex = selectedIslands.indexOf(island.id)
            const connectedIndex = selectedIslands.indexOf(connectedId)

            const isSelected =
              islandIndex !== -1 && connectedIndex !== -1 && Math.abs(islandIndex - connectedIndex) === 1

            // Draw the connection
            ctx.beginPath()
            ctx.moveTo(island.position.x, island.position.y)
            ctx.lineTo(connectedIsland.position.x, connectedIsland.position.y)

            if (isSelected) {
              // Bright path for selected connections
              ctx.strokeStyle = "#fbbf24" // Amber-400
              ctx.lineWidth = 3
              ctx.shadowColor = "#fbbf24"
              ctx.shadowBlur = 8
              ctx.setLineDash([]) // Solid line for selected
            } else {
              // Subtle dotted line for normal connections
              ctx.setLineDash([3, 3])
              ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
              ctx.lineWidth = 1.5
              ctx.shadowBlur = 0
            }

            ctx.stroke()
            ctx.setLineDash([]) // Reset line dash
            ctx.shadowBlur = 0

            // In debug mode, show connection IDs
            if (debug) {
              const midX = (island.position.x + connectedIsland.position.x) / 2
              const midY = (island.position.y + connectedIsland.position.y) / 2
              ctx.font = "10px 'Inter', sans-serif"
              ctx.fillStyle = "white"
              ctx.fillText(`${connectionKey}`, midX, midY)
            }
          }
        }
      })
    })

    // Draw islands
    islands.forEach((island) => {
      const isSelected = selectedIslands.includes(island.id)
      const isLastSelected = selectedIslands.length > 0 && selectedIslands[selectedIslands.length - 1] === island.id
      const shape = islandShapes[island.id]

      if (!shape) return

      // Draw water ripple/surf effect around selected islands
      if (isSelected) {
        ctx.save()
        // Create a clipping region slightly larger than the island
        ctx.beginPath()
        const clipRadius = island.size * 1.8
        ctx.arc(island.position.x, island.position.y, clipRadius, 0, Math.PI * 2)

        // Create a hole in the clipping region for the island itself
        if (shape.beachPoints.length > 0) {
          ctx.moveTo(shape.beachPoints[0].x, shape.beachPoints[0].y)
          for (let i = 1; i < shape.beachPoints.length; i++) {
            ctx.lineTo(shape.beachPoints[i].x, shape.beachPoints[i].y)
          }
          ctx.closePath()
        }

        ctx.clip("evenodd")

        // Draw animated surf/foam rings
        const numRings = 3
        for (let i = 0; i < numRings; i++) {
          ctx.beginPath()
          const ringRadius = island.size * (1.1 + i * 0.15) + Math.sin(time / 3) * 3
          ctx.arc(island.position.x, island.position.y, ringRadius, 0, Math.PI * 2)

          if (isLastSelected) {
            ctx.strokeStyle = "rgba(251, 191, 36, 0.3)" // Amber with transparency
          } else {
            ctx.strokeStyle = "rgba(251, 191, 36, 0.2)" // Amber with more transparency
          }

          ctx.lineWidth = 2
          ctx.stroke()
        }

        ctx.restore()
      }

      // Draw beach (sand)
      if (shape.beachPoints.length > 0) {
        ctx.beginPath()
        ctx.moveTo(shape.beachPoints[0].x, shape.beachPoints[0].y)

        for (let i = 1; i < shape.beachPoints.length; i++) {
          ctx.lineTo(shape.beachPoints[i].x, shape.beachPoints[i].y)
        }

        ctx.closePath()

        // Beach gradient
        const beachGradient = ctx.createRadialGradient(
          island.position.x - island.size / 3,
          island.position.y - island.size / 3,
          0,
          island.position.x,
          island.position.y,
          island.size,
        )

        if (isLastSelected) {
          // Golden sand for last selected
          beachGradient.addColorStop(0, "#fcd34d") // Amber-300
          beachGradient.addColorStop(1, "#d97706") // Amber-600
        } else if (isSelected) {
          // Lighter sand for selected
          beachGradient.addColorStop(0, "#fde68a") // Amber-200
          beachGradient.addColorStop(1, "#f59e0b") // Amber-500
        } else {
          // Normal sand
          beachGradient.addColorStop(0, "#fef3c7") // Amber-50
          beachGradient.addColorStop(1, "#fbbf24") // Amber-400
        }

        ctx.fillStyle = beachGradient
        ctx.fill()
      }

      // Draw island vegetation (main island)
      if (shape.points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(shape.points[0].x, shape.points[0].y)

        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y)
        }

        ctx.closePath()

        // Island vegetation gradient
        const islandGradient = ctx.createRadialGradient(
          island.position.x - island.size / 3,
          island.position.y - island.size / 3,
          0,
          island.position.x,
          island.position.y,
          island.size,
        )

        // Use island ID to determine vegetation variations
        const idSum = island.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)

        if (isSelected) {
          // Brighter vegetation for selected islands
          islandGradient.addColorStop(0, "#84cc16") // Lime-500
          islandGradient.addColorStop(1, "#65a30d") // Lime-600
        } else {
          // Vary vegetation colors based on ID
          if (idSum % 3 === 0) {
            // Lush green
            islandGradient.addColorStop(0, "#84cc16") // Lime-500
            islandGradient.addColorStop(1, "#4d7c0f") // Lime-700
          } else if (idSum % 3 === 1) {
            // Tropical green
            islandGradient.addColorStop(0, "#22c55e") // Green-500
            islandGradient.addColorStop(1, "#15803d") // Green-700
          } else {
            // Darker jungle green
            islandGradient.addColorStop(0, "#16a34a") // Green-600
            islandGradient.addColorStop(1, "#166534") // Green-800
          }
        }

        ctx.fillStyle = islandGradient
        ctx.fill()
      }

      // Draw palm trees
      shape.palmTrees.forEach((tree) => {
        // Don't draw trees if they would overlap with the letter
        const distanceFromCenter = Math.sqrt(
          Math.pow(tree.x - island.position.x, 2) + Math.pow(tree.y - island.position.y, 2),
        )

        if (distanceFromCenter > island.size * 0.3) {
          // Draw trunk
          ctx.beginPath()
          const trunkWidth = tree.size * 0.15
          const trunkHeight = tree.size * 0.8

          // Calculate trunk end point with lean
          const trunkEndX = tree.x + tree.lean * trunkHeight
          const trunkEndY = tree.y - trunkHeight

          ctx.moveTo(tree.x - trunkWidth / 2, tree.y)
          ctx.quadraticCurveTo(tree.x + (tree.lean * trunkHeight) / 2, tree.y - trunkHeight / 2, trunkEndX, trunkEndY)
          ctx.lineWidth = trunkWidth
          ctx.strokeStyle = "#92400e" // Amber-800
          ctx.stroke()

          // Draw palm fronds
          const numFronds = 5
          for (let i = 0; i < numFronds; i++) {
            const frondAngle = (i / numFronds) * Math.PI * 2
            const frondLength = tree.size * 0.6

            ctx.beginPath()
            ctx.moveTo(trunkEndX, trunkEndY)

            // Calculate control point for the curve
            const controlX = trunkEndX + Math.cos(frondAngle) * frondLength * 0.6
            const controlY = trunkEndY + Math.sin(frondAngle) * frondLength * 0.6

            // Calculate end point
            const endX = trunkEndX + Math.cos(frondAngle) * frondLength
            const endY = trunkEndY + Math.sin(frondAngle) * frondLength

            ctx.quadraticCurveTo(controlX, controlY, endX, endY)
            ctx.lineWidth = tree.size * 0.1
            ctx.strokeStyle = "#65a30d" // Lime-600
            ctx.stroke()
          }
        }
      })

      // Draw a letter background circle for better readability
      ctx.beginPath()
      ctx.arc(island.position.x, island.position.y, island.size * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fill()

      // Draw the letter with improved visibility
      ctx.font = `bold ${Math.min(28, island.size * 0.8)}px 'Inter', sans-serif`
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Add text shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.fillText(island.letter, island.position.x, island.position.y)

      // Reset shadow
      ctx.shadowBlur = 0

      // Debug: Show island ID and connections
      if (debug) {
        ctx.font = "10px 'Inter', sans-serif"
        ctx.fillStyle = "white"
        ctx.fillText(island.id, island.position.x, island.position.y + island.size + 15)
        ctx.fillText(
          `Connections: ${island.connections.length}`,
          island.position.x,
          island.position.y + island.size + 30,
        )
      }
    })
  }, [islands, selectedIslands, debug, islandShapes, time])

  // Handle click on islands
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Apply scale to get the correct position on the canvas
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    // Check if click is within any island
    for (const island of islands) {
      const distance = Math.sqrt(Math.pow(x - island.position.x, 2) + Math.pow(y - island.position.y, 2))

      if (distance <= island.size) {
        onIslandClick(island.id)
        break
      }
    }
  }

  // Toggle debug mode with double click
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setDebug(!debug)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-sky-900 bg-sky-950"
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full cursor-pointer"
      />
    </div>
  )
}
