"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import { selectIsland, submitWord, resetSelection, tickTimer, startGame, resetGame } from "@/lib/slices/gameSlice"
import GameControls from "./game-controls"
import GameStatus from "./game-status"
import IslandMap from "./island-map"
import ObjectivesList from "./objectives-list"
import FoundWordsList from "./found-words-list"
import GameOverModal from "./game-over-modal"
import WordControls from "./word-controls"

export default function GameBoard() {
  const dispatch = useAppDispatch()
  const { islands, selectedIslands, foundWords, score, timeLeft, gameActive, objectives, message } = useAppSelector(
    (state) => state.game,
  )

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle timer
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

  // Handle keyboard input for word submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedIslands.length > 0) {
        dispatch(submitWord())
      } else if (e.key === "Escape") {
        dispatch(resetSelection())
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedIslands, dispatch])

  const handleIslandClick = (id: string) => {
    if (gameActive) {
      dispatch(selectIsland(id))
    }
  }

  const handleSubmitWord = () => {
    dispatch(submitWord())
  }

  const handleResetSelection = () => {
    dispatch(resetSelection())
  }

  const handleStartGame = () => {
    dispatch(startGame())
  }

  const handleResetGame = () => {
    dispatch(resetGame())
  }

  // Get the current word being formed
  const currentWord = selectedIslands
    .map((id) => {
      const island = islands.find((i) => i.id === id)
      return island ? island.letter : ""
    })
    .join("")

  return (
    <div className="flex flex-col gap-6">
      {/* Game Status */}
      <GameStatus score={score} timeLeft={timeLeft} message={message} gameActive={gameActive} />

      {/* Main Game Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex flex-col gap-4">
            {/* Island Map */}
            <div className="aspect-square w-full max-w-xl mx-auto">
              <IslandMap islands={islands} selectedIslands={selectedIslands} onIslandClick={handleIslandClick} />
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
