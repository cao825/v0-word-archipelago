"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import {
  selectIsland,
  submitWord,
  resetSelection,
  tickTimer,
  startGame,
  resetGame,
  setGameTheme,
  checkForNewPuzzle,
  type GameTheme,
} from "@/lib/slices/gameSlice"
import IslandMap from "./island-map"
import ObjectivesList from "./objectives-list"
import FoundWordsList from "./found-words-list"
import GameOverModal from "./game-over-modal"
import WordControls from "./word-controls"
import LiveWordDisplay from "./live-word-display"
import AudioManager from "./audio-manager"
import PointsAnimation from "./points-animation"
import NextPuzzleCountdown from "./next-puzzle-countdown"
import MobileSettingsSheet from "./mobile-settings-sheet"
import CompactTopBar from "./compact-top-bar"
import PillButton from "./pill-button"
import FloatingGameControls from "./floating-game-controls"

export default function GameBoard() {
  const dispatch = useAppDispatch()
  const {
    islands,
    selectedIslands,
    foundWords,
    score,
    timeLeft,
    gameActive,
    objectives,
    message,
    theme,
    invalidSubmission,
    duplicateSubmission,
    successfulSubmission,
    comboCount,
  } = useAppSelector((state) => state.game)

  const [showSettings, setShowSettings] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const puzzleCheckRef = useRef<NodeJS.Timeout | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)

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

  // Handle timer with useCallback for better performance
  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        dispatch(tickTimer())
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameActive, dispatch])

  // Check for new puzzle every minute
  useEffect(() => {
    // Check immediately on component mount
    dispatch(checkForNewPuzzle())

    // Then check every minute
    puzzleCheckRef.current = setInterval(() => {
      dispatch(checkForNewPuzzle())
    }, 60000)

    return () => {
      if (puzzleCheckRef.current) {
        clearInterval(puzzleCheckRef.current)
      }
    }
  }, [dispatch])

  // Memoize event handlers to prevent unnecessary re-renders
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedIslands.length > 0) {
        dispatch(submitWord())
      } else if (e.key === "Escape") {
        dispatch(resetSelection())
      }
    },
    [selectedIslands, dispatch],
  )

  // Handle keyboard input for word submission
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [handleKeyDown])

  // Memoize event handlers
  const handleIslandClick = useCallback(
    (id: string) => {
      if (gameActive) {
        dispatch(selectIsland(id))
      }
    },
    [gameActive, dispatch],
  )

  const handleIslandDoubleTap = useCallback(
    (id: string) => {
      if (gameActive && selectedIslands.length > 0) {
        // If this is the same island as the last selected, submit the word
        if (selectedIslands[selectedIslands.length - 1] === id) {
          dispatch(submitWord())
        }
      }
    },
    [gameActive, selectedIslands, dispatch],
  )

  const handleSubmitWord = useCallback(() => {
    dispatch(submitWord())
  }, [dispatch])

  const handleResetSelection = useCallback(() => {
    dispatch(resetSelection())
  }, [dispatch])

  const handleStartGame = useCallback(() => {
    dispatch(startGame())
  }, [dispatch])

  const handleResetGame = useCallback(() => {
    dispatch(resetGame())
  }, [dispatch])

  const handleSetGameTheme = useCallback(
    (theme: GameTheme) => {
      dispatch(setGameTheme(theme))
    },
    [dispatch],
  )

  const handleToggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
  }, [])

  // Memoize the current word to avoid recalculating on every render
  const currentWord = useMemo(() => {
    return selectedIslands
      .map((id) => {
        const island = islands.find((i) => i.id === id)
        return island ? island.letter : ""
      })
      .join("")
  }, [selectedIslands, islands])

  // Memoize the word validity check
  const isWordValid = useMemo(() => {
    return currentWord.length >= 2 && !foundWords.includes(currentWord.toLowerCase())
  }, [currentWord, foundWords])

  // Count completed objectives
  const completedObjectivesCount = objectives.filter((obj) => obj.completed).length

  // Maintain a fixed height for the game area to prevent layout shifts
  useEffect(() => {
    if (gameAreaRef.current) {
      const setFixedHeight = () => {
        const gameArea = gameAreaRef.current
        if (gameArea) {
          // Set a minimum height based on content
          const minHeight = gameActive ? "600px" : "400px"
          gameArea.style.minHeight = minHeight
        }
      }

      setFixedHeight()
      window.addEventListener("resize", setFixedHeight)

      return () => {
        window.removeEventListener("resize", setFixedHeight)
      }
    }
  }, [gameActive])

  return (
    <div className="flex flex-col gap-1" ref={gameAreaRef}>
      {/* Audio Manager */}
      <AudioManager />

      {/* Points Animation */}
      <PointsAnimation />

      {/* Compact Top Bar */}
      {gameActive && (
        <CompactTopBar
          score={score}
          timeLeft={timeLeft}
          comboCount={comboCount}
          onOpenSettings={handleToggleSettings}
          onResetGame={handleResetGame}
          gameActive={gameActive}
          theme={theme}
        />
      )}

      {/* Live Word Display - always show when game is active to maintain layout */}
      {gameActive && (
        <LiveWordDisplay
          currentWord={currentWord}
          isValid={isWordValid}
          invalidSubmission={invalidSubmission}
          duplicateSubmission={duplicateSubmission}
        />
      )}

      {/* Main game area with fixed height container */}
      <div className="flex flex-col gap-1">
        {/* Island Map */}
        <div className="aspect-square w-full max-w-xl mx-auto">
          <IslandMap
            islands={islands}
            selectedIslands={selectedIslands}
            onIslandClick={handleIslandClick}
            onIslandDoubleTap={handleIslandDoubleTap}
            theme={theme}
            invalidSubmission={invalidSubmission}
            successfulSubmission={successfulSubmission}
          />
        </div>

        {/* Word Controls - Directly below the map */}
        {gameActive && (
          <WordControls
            currentWord={currentWord}
            selectedIslands={selectedIslands}
            onSubmitWord={handleSubmitWord}
            onResetSelection={handleResetSelection}
            isMobile={isMobile}
          />
        )}

        {/* Pill Buttons for Objectives and Found Words */}
        {gameActive && (
          <div className="flex justify-center gap-2 mt-1">
            <PillButton label="Objectives" count={completedObjectivesCount} defaultOpen={false}>
              <ObjectivesList objectives={objectives} />
            </PillButton>

            <PillButton label="Words" count={foundWords.length} defaultOpen={false}>
              <FoundWordsList foundWords={foundWords} />
            </PillButton>
          </div>
        )}

        {/* Next Puzzle Countdown - only show when game is not active */}
        {!gameActive && timeLeft !== 0 && (
          <div className="mt-1">
            <NextPuzzleCountdown />
          </div>
        )}
      </div>

      {/* Floating Game Controls */}
      <FloatingGameControls
        onStartGame={handleStartGame}
        onResetGame={handleResetGame}
        onOpenSettings={handleToggleSettings}
        gameActive={gameActive}
      />

      {/* Game Over Modal */}
      {!gameActive && timeLeft === 0 && (
        <GameOverModal score={score} foundWords={foundWords} objectives={objectives} onResetGame={handleResetGame} />
      )}

      {/* Mobile Settings Sheet */}
      <MobileSettingsSheet
        isOpen={showSettings}
        onClose={handleToggleSettings}
        currentTheme={theme}
        onSetTheme={handleSetGameTheme}
      />
    </div>
  )
}
