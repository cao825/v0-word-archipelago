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
  resetInvalidSubmission,
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
import FloatingGameControls from "./floating-game-controls"
import ModalOverlay from "./modal-overlay"
import WordFoundToast from "./word-found-toast"
// Add the import for the new component
import GameNotification from "./game-notification"

export default function GameBoard() {
  const dispatch = useAppDispatch()

  // Use selective state extraction to prevent unnecessary re-renders
  const islands = useAppSelector((state) => state.game.islands)
  const selectedIslands = useAppSelector((state) => state.game.selectedIslands)
  const foundWords = useAppSelector((state) => state.game.foundWords)
  const score = useAppSelector((state) => state.game.score)
  const timeLeft = useAppSelector((state) => state.game.timeLeft)
  const gameActive = useAppSelector((state) => state.game.gameActive)
  const objectives = useAppSelector((state) => state.game.objectives)
  const theme = useAppSelector((state) => state.game.theme)
  const invalidSubmission = useAppSelector((state) => state.game.invalidSubmission)
  const duplicateSubmission = useAppSelector((state) => state.game.duplicateSubmission)
  const successfulSubmission = useAppSelector((state) => state.game.successfulSubmission)
  const comboCount = useAppSelector((state) => state.game.comboCount)

  const [showSettings, setShowSettings] = useState(false)
  const [showObjectivesModal, setShowObjectivesModal] = useState(false)
  const [showFoundWordsModal, setShowFoundWordsModal] = useState(false)
  const [wordFoundToast, setWordFoundToast] = useState({ word: "", points: 0, visible: false })
  const [isMobile, setIsMobile] = useState(false)
  // Add state for the notification
  const [showGameNotification, setShowGameNotification] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const puzzleCheckRef = useRef<NodeJS.Timeout | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastFoundWordRef = useRef<string>("")
  const lastScoreRef = useRef<number>(0)

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

    // Function to determine check interval based on time
    const getCheckInterval = () => {
      const now = new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      // Check more frequently near the hour change
      if (minutes >= 59 && seconds >= 45) {
        return 1000 // Every second in the last 15 seconds of the hour
      } else if (minutes >= 59) {
        return 5000 // Every 5 seconds in the last minute of the hour
      } else if (minutes >= 58) {
        return 15000 // Every 15 seconds in the second-to-last minute
      } else {
        return 60000 // Every minute otherwise
      }
    }

    // Set up the interval checker that adjusts its frequency
    const setupChecker = () => {
      dispatch(checkForNewPuzzle())
      const interval = getCheckInterval()
      puzzleCheckRef.current = setTimeout(() => {
        setupChecker()
      }, interval)
    }

    setupChecker()

    return () => {
      if (puzzleCheckRef.current) {
        clearTimeout(puzzleCheckRef.current)
      }
    }
  }, [dispatch])

  // Show toast when a new word is found
  useEffect(() => {
    if (foundWords.length > 0 && lastFoundWordRef.current !== foundWords[0] && score > lastScoreRef.current) {
      const newWord = foundWords[0]
      const pointsEarned = score - lastScoreRef.current

      setWordFoundToast({
        word: newWord.toUpperCase(),
        points: pointsEarned,
        visible: true,
      })

      lastFoundWordRef.current = newWord
      lastScoreRef.current = score
    }
  }, [foundWords, score])

  // Handle invalid submission feedback
  useEffect(() => {
    if (invalidSubmission || duplicateSubmission) {
      // Reset the invalid submission state after a short delay
      const timer = setTimeout(() => {
        dispatch(resetInvalidSubmission())
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [invalidSubmission, duplicateSubmission, dispatch])

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
    lastScoreRef.current = 0
    lastFoundWordRef.current = ""
  }, [dispatch])

  const handleResetGame = useCallback(() => {
    dispatch(resetGame())
    lastScoreRef.current = 0
    lastFoundWordRef.current = ""
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

  const handleShowObjectives = useCallback(() => {
    setShowObjectivesModal(true)
  }, [])

  const handleShowFoundWords = useCallback(() => {
    setShowFoundWordsModal(true)
  }, [])

  const handleCloseWordFoundToast = useCallback(() => {
    setWordFoundToast((prev) => ({ ...prev, visible: false }))
  }, [])

  // Add a handler for pre-game clicks
  const handlePreGameClick = useCallback(() => {
    setShowGameNotification(true)
  }, [])

  // Add the handler for closing the notification
  const handleCloseGameNotification = useCallback(() => {
    setShowGameNotification(false)
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
  const completedObjectivesCount = useMemo(() => {
    return objectives.filter((obj) => obj.completed).length
  }, [objectives])

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

      {/* Game Notification */}
      <GameNotification
        isVisible={showGameNotification}
        onClose={handleCloseGameNotification}
        message="Tap the Play button to start a game!"
      />

      {/* Word Found Toast */}
      <WordFoundToast
        word={wordFoundToast.word}
        points={wordFoundToast.points}
        isVisible={wordFoundToast.visible}
        onClose={handleCloseWordFoundToast}
      />

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
          objectivesCompleted={completedObjectivesCount}
          totalObjectives={objectives.length}
          foundWordsCount={foundWords.length}
          onShowObjectives={handleShowObjectives}
          onShowFoundWords={handleShowFoundWords}
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
            onPreGameClick={handlePreGameClick}
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

      {/* Objectives Modal */}
      <ModalOverlay isOpen={showObjectivesModal} onClose={() => setShowObjectivesModal(false)} title="Objectives">
        <ObjectivesList objectives={objectives} />
      </ModalOverlay>

      {/* Found Words Modal */}
      <ModalOverlay isOpen={showFoundWordsModal} onClose={() => setShowFoundWordsModal(false)} title="Found Words">
        <FoundWordsList foundWords={foundWords} />
      </ModalOverlay>

      {/* Game Notification */}
      <GameNotification isOpen={showGameNotification} onClose={handleCloseGameNotification} />
    </div>
  )
}
