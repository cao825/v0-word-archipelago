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
  setGameDuration,
  setGameTheme,
  setRequireAdjacent,
  type GameDuration,
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
import { Button } from "./ui/button"

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
    gameDuration,
    invalidSubmission,
    successfulSubmission,
    comboCount,
    requireAdjacent,
  } = useAppSelector((state) => state.game)

  const [showSettings, setShowSettings] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleSetGameDuration = useCallback(
    (duration: GameDuration) => {
      dispatch(setGameDuration(duration))
    },
    [dispatch],
  )

  const handleSetGameTheme = useCallback(
    (theme: GameTheme) => {
      dispatch(setGameTheme(theme))
    },
    [dispatch],
  )

  const handleSetRequireAdjacent = useCallback(
    (require: boolean) => {
      dispatch(setRequireAdjacent(require))
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
    <div className="flex flex-col gap-6">
      {/* Audio Manager */}
      <AudioManager />

      {/* Points Animation */}
      <PointsAnimation />

      {/* Game Status */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <GameStatus
            score={score}
            timeLeft={timeLeft}
            message={message}
            gameActive={gameActive}
            comboCount={comboCount}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSettings}
              className="border-sky-600 text-sky-100 hover:bg-sky-700"
            >
              Settings
            </Button>
          </div>
        </div>

        {showSettings && !gameActive && (
          <GameSettings
            currentTheme={theme}
            currentDuration={gameDuration}
            requireAdjacent={requireAdjacent}
            onSetTheme={handleSetGameTheme}
            onSetDuration={handleSetGameDuration}
            onSetRequireAdjacent={handleSetRequireAdjacent}
            onClose={handleToggleSettings}
          />
        )}
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex flex-col gap-4">
            {/* Live Word Display */}
            {gameActive && (
              <LiveWordDisplay currentWord={currentWord} isValid={isWordValid} invalidSubmission={invalidSubmission} />
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
              <GameControls onStartGame={handleStartGame} onResetGame={handleResetGame} gameDuration={gameDuration} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
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
