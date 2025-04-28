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
import GameControls from "./game-controls"
import GameStatus from "./game-status"
import IslandMap from "./island-map"
import ObjectivesList from "./objectives-list"
import FoundWordsList from "./found-words-list"
import GameOverModal from "./game-over-modal"
import WordControls from "./word-controls"
import LiveWordDisplay from "./live-word-display"
import GameSettings from "./game-settings"
import PointsAnimation from "./points-animation"
import AudioManager from "./audio-manager"
import NextPuzzleCountdown from "./next-puzzle-countdown"
import { Button } from "./ui/button"
import { Settings } from "lucide-react"

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
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const puzzleCheckRef = useRef<NodeJS.Timeout | null>(null)

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
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
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

  return (
    <div className="flex flex-col gap-4">
      {/* Audio Manager */}
      <AudioManager />

      {/* Points Animation */}
      <PointsAnimation />

      {/* Game Status */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <GameStatus
                score={score}
                timeLeft={timeLeft}
                message={message}
                gameActive={gameActive}
                comboCount={comboCount}
              />

              {!gameActive && <NextPuzzleCountdown />}
            </div>

            {gameActive && (
              <div className="text-center text-sky-200 text-xs tracking-wide uppercase">
                Select islands to form words
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleSettings}
            className="border-sky-300 bg-sky-700 text-white hover:bg-sky-600 hover:text-white"
          >
            <Settings size={18} />
          </Button>
        </div>

        {showSettings && !gameActive && (
          <GameSettings currentTheme={theme} onSetTheme={handleSetGameTheme} onClose={handleToggleSettings} />
        )}
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-3">
            {/* Live Word Display */}
            {gameActive && (
              <LiveWordDisplay
                currentWord={currentWord}
                isValid={isWordValid}
                invalidSubmission={invalidSubmission}
                duplicateSubmission={duplicateSubmission}
              />
            )}

            {/* Island Map */}
            <div className="aspect-square w-full max-w-xl mx-auto">
              <IslandMap
                islands={islands}
                selectedIslands={selectedIslands}
                onIslandClick={handleIslandClick}
                theme={theme}
                invalidSubmission={invalidSubmission}
                successfulSubmission={successfulSubmission}
              />
            </div>

            {/* Word Controls - Directly below the map */}
            {gameActive ? (
              <WordControls
                currentWord={currentWord}
                selectedIslands={selectedIslands}
                onSubmitWord={handleSubmitWord}
                onResetSelection={handleResetSelection}
              />
            ) : (
              <GameControls onStartGame={handleStartGame} onResetGame={handleResetGame} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Objectives and Found Words */}
          <ObjectivesList objectives={objectives} />
          <FoundWordsList foundWords={foundWords} />
        </div>
      </div>

      {!gameActive && timeLeft === 0 && (
        <GameOverModal score={score} foundWords={foundWords} objectives={objectives} onResetGame={handleResetGame} />
      )}
    </div>
  )
}
