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
import GameNotification from "./game-notification"
import ObjectiveCompleteNotification from "./objective-complete-notification"
import ShareResults from "./share-results"
import MiniAchievement from "./mini-achievement"

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
  const puzzleDate = useAppSelector((state) => state.game.gameTimestamp)

  const [showSettings, setShowSettings] = useState(false)
  const [showObjectivesModal, setShowObjectivesModal] = useState(false)
  const [showFoundWordsModal, setShowFoundWordsModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [wordFoundToast, setWordFoundToast] = useState({ word: "", points: 0, visible: false })
  const [isMobile, setIsMobile] = useState(false)
  const [showGameNotification, setShowGameNotification] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  // Add state for mini achievements
  const [miniAchievement, setMiniAchievement] = useState({ title: "", visible: false })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const puzzleCheckRef = useRef<NodeJS.Timeout | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastFoundWordRef = useRef<string>("")
  const lastScoreRef = useRef<number>(0)

  // Detect mobile devices and set viewport height
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
        setViewportHeight(window.innerHeight)
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
    if (successfulSubmission && foundWords.length > 0) {
      const newWord = foundWords[0]
      // Calculate points earned - if we can't determine exactly, use a reasonable estimate
      const pointsEarned = score - lastScoreRef.current > 0 ? score - lastScoreRef.current : newWord.length * 10 // Fallback calculation

      setWordFoundToast({
        word: newWord.toUpperCase(),
        points: pointsEarned,
        visible: true,
      })

      lastFoundWordRef.current = newWord
      lastScoreRef.current = score
    }
  }, [successfulSubmission, foundWords, score])

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

  const handleShowShareModal = useCallback(() => {
    setShowShareModal(true)
  }, [])

  const handleCloseWordFoundToast = useCallback(() => {
    setWordFoundToast((prev) => ({ ...prev, visible: false }))
  }, [])

  // Add a handler for pre-game clicks
  const handlePreGameClick = useCallback(() => {
    if (!gameActive) {
      handleStartGame()
    }
  }, [gameActive, handleStartGame])

  // Add the handler for closing the notification
  const handleCloseGameNotification = useCallback(() => {
    setShowGameNotification(false)
  }, [])

  // Add handler for closing mini achievement
  const handleCloseMiniAchievement = useCallback(() => {
    setMiniAchievement((prev) => ({ ...prev, visible: false }))
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

  // Calculate available height for the game area
  const calculateGameAreaHeight = useCallback(() => {
    if (!gameActive) return "auto"

    // Top bar height (12) + progress bar (1) + word display (10) + word controls (12) + margins/padding (4)
    const uiElementsHeight = 39

    // Calculate remaining height in viewport units
    const remainingHeight = viewportHeight - uiElementsHeight * 16 // Convert rem to px (assuming 1rem = 16px)

    return remainingHeight > 300 ? remainingHeight : 300 // Minimum height of 300px
  }, [gameActive, viewportHeight])

  // Calculate game area height
  const gameAreaHeight = useMemo(() => calculateGameAreaHeight(), [calculateGameAreaHeight])

  // Add a function to show mini achievements
  const showMiniAchievement = useCallback((title: string) => {
    setMiniAchievement({ title, visible: true })
  }, [])

  // Add effect to check for achievements
  useEffect(() => {
    // Check for word length achievements
    if (successfulSubmission && foundWords.length > 0) {
      const newWord = foundWords[0]

      // First word achievement
      if (foundWords.length === 1) {
        showMiniAchievement("First Word Found!")
      }

      // Word length achievements
      if (newWord.length >= 6) {
        showMiniAchievement(`${newWord.length}-Letter Word!`)
      }

      // Combo achievements
      if (comboCount >= 3) {
        showMiniAchievement(`${comboCount}x Combo!`)
      }
    }

    // Check for objective achievements
    const completedCount = objectives.filter((obj) => obj.completed).length
    if (completedCount > 0 && completedCount === objectives.length) {
      showMiniAchievement("All Objectives Completed!")
    }
  }, [successfulSubmission, foundWords, comboCount, objectives, showMiniAchievement])

  return (
    <div className="flex flex-col" ref={gameAreaRef}>
      {/* Audio Manager */}
      <AudioManager />

      {/* Points Animation */}
      <PointsAnimation />

      {/* Objective Complete Notification */}
      <ObjectiveCompleteNotification />

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

      {/* Mini Achievement */}
      <MiniAchievement
        title={miniAchievement.title}
        isVisible={miniAchievement.visible}
        onClose={handleCloseMiniAchievement}
      />

      {/* Compact Top Bar - Only show during active gameplay */}
      {gameActive && (
        <CompactTopBar
          score={score}
          timeLeft={timeLeft}
          comboCount={comboCount}
          onOpenSettings={handleToggleSettings}
          gameActive={gameActive}
          theme={theme}
          objectivesCompleted={completedObjectivesCount}
          totalObjectives={objectives.length}
          foundWordsCount={foundWords.length}
          onShowObjectives={handleShowObjectives}
          onShowFoundWords={handleShowFoundWords}
          onShowShareModal={handleShowShareModal}
          onResetGame={handleResetGame}
        />
      )}

      {/* Live Word Display - only show when game is active */}
      {gameActive && (
        <LiveWordDisplay
          currentWord={currentWord}
          isValid={isWordValid}
          invalidSubmission={invalidSubmission}
          duplicateSubmission={duplicateSubmission}
        />
      )}

      {/* Main game area with dynamic height */}
      <div className="flex flex-col">
        {/* Next Puzzle Countdown - only show when game is not active */}
        {!gameActive && timeLeft !== 0 && (
          <div className="mb-4">
            <NextPuzzleCountdown />
          </div>
        )}

        {/* Island Map with dynamic sizing */}
        <div
          className="w-full mx-auto"
          style={{
            height: gameActive ? `${gameAreaHeight}px` : "auto",
            maxHeight: gameActive ? `${gameAreaHeight}px` : "none",
            aspectRatio: gameActive ? "auto" : "1/1",
            maxWidth: "600px",
          }}
        >
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

        {/* Word Controls - Only show during active gameplay */}
        {gameActive && (
          <WordControls
            currentWord={currentWord}
            selectedIslands={selectedIslands}
            onSubmitWord={handleSubmitWord}
            onResetSelection={handleResetSelection}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Floating Game Controls - Only show start button before game starts */}
      <FloatingGameControls
        onStartGame={handleStartGame}
        onResetGame={handleResetGame}
        onOpenSettings={handleToggleSettings}
        gameActive={gameActive}
      />

      {/* Game Over Modal */}
      {!gameActive && timeLeft === 0 && (
        <GameOverModal
          score={score}
          foundWords={foundWords}
          objectives={objectives}
          onResetGame={handleResetGame}
          onShare={handleShowShareModal}
        />
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

      {/* Share Results Modal */}
      <ModalOverlay isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Your Results">
        <ShareResults
          score={score}
          foundWordsCount={foundWords.length}
          completedObjectives={completedObjectivesCount}
          totalObjectives={objectives.length}
          puzzleDate={puzzleDate}
        />
      </ModalOverlay>
    </div>
  )
}
