"use client"

import type React from "react"
import { useRef, useEffect, useState, useMemo, useCallback } from "react"
import type { Island } from "../lib/slices/gameSlice"
import type { GameTheme } from "../lib/slices/gameSlice"
import { useSpring, animated } from "react-spring"

// Add a new prop for handling pre-game clicks
interface IslandMapProps {
  islands: Island[]
  selectedIslands: string[]
  onIslandClick: (id: string) => void
  onIslandDoubleTap?: (id: string) => void
  onPreGameClick?: () => void // Add this new prop
  theme?: GameTheme
  invalidSubmission?: boolean
  successfulSubmission?: boolean
}

// Interface for storing island shapes
interface IslandShape {
  points: { x: number; y: number }[]
  beachPoints: { x: number; y: number }[]
  palmTrees: { x: number; y: number; size: number; lean: number }[]
}

// Update the function signature to include the new prop
export default function IslandMap({
  islands,
  selectedIslands,
  onIslandClick,
  onIslandDoubleTap,
  onPreGameClick, // Add this new prop
  theme = "tropical",
  invalidSubmission = false,
  successfulSubmission = false,
}: IslandMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [time, setTime] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const [lastClickedIsland, setLastClickedIsland] = useState<string | null>(null)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [lastTapIsland, setLastTapIsland] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hasShaken, setHasShaken] = useState(false)
  const renderedRef = useRef(false)

  // Reset the hasShaken state when invalidSubmission changes
  useEffect(() => {
    // When invalidSubmission becomes true, we want to trigger the animation
    // When it becomes false, we want to reset the state
    setHasShaken(false)
  }, [invalidSubmission])

  // Detect mobile devices
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      checkMobile()
      window.addEventListener("resize", checkMobile)

      return () => {
        window.removeEventListener("resize", checkMobile)
      }
    }
  }, [])

  // Handle shake animation for invalid submission
  const shakeAnimation = useSpring({
    x: invalidSubmission && !hasShaken ? 1 : 0,
    config: {
      mass: 0.8,
      tension: 400, // Higher tension for snappier animation
      friction: 8, // Lower friction for faster movement
      duration: 200, // Shorter duration
    },
    onRest: () => {
      if (invalidSubmission && !hasShaken) {
        setHasShaken(true)
      }
    },
  })

  // Handle pulse animation for successful submission
  const pulseAnimation = useSpring({
    scale: successfulSubmission ? 1.02 : 1, // Smaller scale for subtler effect
    config: { tension: 400, friction: 8 }, // Snappier animation
  })

  // Animation timer for water movement - optimized with requestAnimationFrame
  useEffect(() => {
    if (typeof window !== "undefined") {
      let lastTime = 0
      const animate = (timestamp: number) => {
        if (timestamp - lastTime > 100) {
          // Only update every 100ms for better performance
          setTime((prev) => (prev + 1) % 1000)
          lastTime = timestamp
        }
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
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

  // Resize canvas to fit container - optimized with useCallback
  const resizeCanvas = useCallback(() => {
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
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)
      return () => window.removeEventListener("resize", resizeCanvas)
    }
  }, [resizeCanvas])

  // Memoize theme colors to avoid recalculating on every render
  const themeColors = useMemo(() => {
    // Set theme colors
    let oceanColors = {
      start: "#0891b2", // Cyan-600
      mid: "#0e7490", // Cyan-700
      end: "#155e75", // Cyan-800
    }

    let skyColors = {
      horizon: "rgba(255, 255, 255, 0.1)",
      waves: "rgba(255, 255, 255, 0.1)",
    }

    const islandColors = {
      vegetation: {
        start: "#84cc16", // Lime-500
        end: "#4d7c0f", // Lime-700
      },
      beach: {
        start: "#fef3c7", // Amber-50
        end: "#fbbf24", // Amber-400
      },
      selected: {
        vegetation: {
          start: "#84cc16", // Lime-500
          end: "#65a30d", // Lime-600
        },
        beach: {
          start: "#fde68a", // Amber-200
          end: "#f59e0b", // Amber-500
        },
      },
      lastSelected: {
        beach: {
          start: "#fcd34d", // Amber-300
          end: "#d97706", // Amber-600
        },
      },
    }

    // Apply theme variations
    if (theme === "sunset") {
      oceanColors = {
        start: "#0369a1", // Blue-600
        mid: "#075985", // Blue-700
        end: "#0c4a6e", // Blue-800
      }

      skyColors = {
        horizon: "rgba(251, 146, 60, 0.2)", // Orange-400 with transparency
        waves: "rgba(251, 146, 60, 0.15)",
      }

      islandColors.vegetation = {
        start: "#65a30d", // Lime-600
        end: "#3f6212", // Lime-800
      }
    } else if (theme === "stormy") {
      oceanColors = {
        start: "#1e40af", // Blue-800
        mid: "#1e3a8a", // Blue-900
        end: "#0f172a", // Slate-900
      }

      skyColors = {
        horizon: "rgba(148, 163, 184, 0.2)", // Slate-400 with transparency
        waves: "rgba(148, 163, 184, 0.15)",
      }

      islandColors.vegetation = {
        start: "#4d7c0f", // Lime-700
        end: "#365314", // Lime-900
      }

      islandColors.beach = {
        start: "#fcd34d", // Amber-300
        end: "#d97706", // Amber-600
      }
    } else if (theme === "volcanic") {
      oceanColors = {
        start: "#7f1d1d", // Red-900
        mid: "#991b1b", // Red-800
        end: "#450a0a", // Red-950
      }

      skyColors = {
        horizon: "rgba(254, 202, 202, 0.2)", // Red-200 with transparency
        waves: "rgba(254, 202, 202, 0.15)",
      }

      islandColors.vegetation = {
        start: "#4d7c0f", // Lime-700
        end: "#365314", // Lime-900
      }

      islandColors.beach = {
        start: "#737373", // Neutral-500
        end: "#404040", // Neutral-700
      }
    }

    return { oceanColors, skyColors, islandColors }
  }, [theme])

  // Draw the map - optimized to reduce calculations
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Skip first render to avoid unnecessary work
    if (!renderedRef.current) {
      renderedRef.current = true
      return
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { oceanColors, skyColors, islandColors } = themeColors

    // Draw tropical ocean background
    const oceanGradient = ctx.createRadialGradient(300, 300, 0, 300, 300, 400)
    oceanGradient.addColorStop(0, oceanColors.start)
    oceanGradient.addColorStop(0.7, oceanColors.mid)
    oceanGradient.addColorStop(1, oceanColors.end)
    ctx.fillStyle = oceanGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw animated wave pattern - optimized to reduce number of waves
    ctx.strokeStyle = skyColors.waves
    ctx.lineWidth = 1.5

    // Draw wavy lines for ocean effect with animation - reduced number of lines
    for (let y = 0; y < canvas.height; y += 40) {
      // Increased spacing between waves
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x += 10) {
        // Increased step size
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
          }
        }
      })
    })

    // Draw islands - optimized to reduce calculations
    islands.forEach((island) => {
      const isSelected = selectedIslands.includes(island.id)
      const isLastSelected = selectedIslands.length > 0 && selectedIslands[selectedIslands.length - 1] === island.id
      const isJustClicked = lastClickedIsland === island.id
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

        // Draw animated surf/foam rings - reduced number of rings for performance
        const numRings = 2 // Reduced from 3
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
          beachGradient.addColorStop(0, islandColors.lastSelected.beach.start)
          beachGradient.addColorStop(1, islandColors.lastSelected.beach.end)
        } else if (isSelected) {
          // Lighter sand for selected
          beachGradient.addColorStop(0, islandColors.selected.beach.start)
          beachGradient.addColorStop(1, islandColors.selected.beach.end)
        } else {
          // Normal sand
          beachGradient.addColorStop(0, islandColors.beach.start)
          beachGradient.addColorStop(1, islandColors.beach.end)
        }

        ctx.fillStyle = beachGradient
        ctx.fill()
      }

      // Draw island vegetation (main island)
      if (shape.points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(shape.points[0].x, shape.points[0].y)

        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.beachPoints[i].y)
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
          islandGradient.addColorStop(0, islandColors.selected.vegetation.start)
          islandGradient.addColorStop(1, islandColors.selected.vegetation.end)
        } else {
          // Vary vegetation colors based on ID
          if (idSum % 3 === 0) {
            // Lush green
            islandGradient.addColorStop(0, islandColors.vegetation.start)
            islandGradient.addColorStop(1, islandColors.vegetation.end)
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

      // Draw palm trees - only for larger islands to improve performance
      if (island.size > 35) {
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

            // Draw palm fronds - reduced number for performance
            const numFronds = 4 // Reduced from 5
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
      }

      // Draw a letter background circle for better readability
      ctx.beginPath()
      ctx.arc(island.position.x, island.position.y, island.size * 0.35, 0, Math.PI * 2)

      // Use a more visible background for selected islands
      if (isLastSelected) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.6)" // Amber-400 with more opacity
      } else if (isSelected) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.4)" // Amber-400 with opacity
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      }
      ctx.fill()

      // Draw the letter with improved visibility
      const fontSize = isSelected
        ? Math.min(32, island.size * 0.9)
        : // Larger font for selected
          Math.min(28, island.size * 0.8) // Normal font

      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Add text shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Add a subtle pop animation for selected islands
      if (isSelected) {
        const bounceOffset = Math.sin(time / 1.5) * 1.5 // Faster animation
        ctx.fillText(island.letter, island.position.x, island.position.y + bounceOffset)
      } else {
        ctx.fillText(island.letter, island.position.x, island.position.y)
      }

      // Draw a quick flash effect for just-clicked islands
      if (isJustClicked) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(island.position.x, island.position.y, island.size * 0.6, 0, Math.PI * 2)

        // Create radial gradient for flash
        const flashGradient = ctx.createRadialGradient(
          island.position.x,
          island.position.y,
          0,
          island.position.x,
          island.position.y,
          island.size * 0.6,
        )

        flashGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)")
        flashGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.fillStyle = flashGradient
        ctx.fill()
        ctx.restore()
      }

      // Reset shadow
      ctx.shadowBlur = 0
    })
  }, [islands, selectedIslands, islandShapes, time, themeColors, lastClickedIsland])

  // Handle click on islands - optimized with useCallback
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      // Apply scale to get the correct position on the canvas
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale

      // Check if click is within any island
      for (const island of islands) {
        const distance = Math.sqrt(Math.pow(x - island.position.x, 2) + Math.pow(y - island.position.y, 2))

        // Increase tap target size on mobile for better touch experience
        const tapTargetSize = isMobile ? Math.max(island.size, 22) : island.size

        if (distance <= tapTargetSize) {
          // Set the last clicked island for animation
          setLastClickedIsland(island.id)

          // Clear the animation after a short delay
          setTimeout(() => {
            setLastClickedIsland(null)
          }, 100) // Shorter flash duration for better responsiveness

          // If onPreGameClick is provided and we're not in a game, call it
          if (onPreGameClick && selectedIslands.length === 0) {
            onPreGameClick()
            return
          }

          // Handle double tap
          const now = Date.now()
          if (onIslandDoubleTap && lastTapIsland === island.id && now - lastTapTime < 300) {
            // Double tap detected
            onIslandDoubleTap(island.id)
          } else {
            // Single tap
            onIslandClick(island.id)
          }

          // Update tap tracking
          setLastTapTime(now)
          setLastTapIsland(island.id)

          break
        }
      }
    },
    [
      islands,
      scale,
      onIslandClick,
      onIslandDoubleTap,
      onPreGameClick,
      lastTapTime,
      lastTapIsland,
      isMobile,
      selectedIslands.length,
    ],
  )

  // Create a CSS transform string for the shake effect
  const shakeTransform = shakeAnimation.x.to((x) => {
    if (x === 0) return "translateX(0px)"
    // Create a shake effect using a dampened sine wave
    const dampening = 1 - x
    return `translateX(${Math.sin(x * Math.PI * 10) * 5 * dampening}px)`
  })

  // Create a CSS transform string for the pulse effect
  const pulseTransform = pulseAnimation.scale.to((s) => `scale(${s})`)

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-sky-900 bg-sky-950"
    >
      <animated.div
        style={{
          width: "100%",
          height: "100%",
          transform: invalidSubmission ? shakeTransform : pulseTransform,
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
        />
      </animated.div>
    </div>
  )
}
