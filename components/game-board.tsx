"use client"

import type React from "react"
import { useState, useEffect, useRef, lazy, Suspense, useEffectEvent } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks"
import {
  selectIsland,
  submitWord,
  resetSelection,
  startGame,
  resetGame,
  resetGameAfterReview,
  setGameTheme,
  type GameTheme,
  resetInvalidSubmission,
  hidePointsAnimation,
} from "@/lib/slices/gameSlice"
import { useGameTimer } from "@/lib/hooks/use-game-timer"
import { usePuzzleChecker } from "@/lib/hooks/use-puzzle-checker"
import { useViewport } from "@/lib/hooks/use-viewport"
import { BONUS_WORD_MIN_LENGTH, COMBO_BONUS_THRESHOLD } from "@/lib/constants"
import { Activity } from "react"

import IslandMap from "./island-map"
import ObjectivesList from "./objectives-list"
import FoundWordsList from "./found-words-list"
import WordControls from "./word-controls"
import LiveWordDisplay from "./live-word-display"
import AudioManager from "./audio-manager"
import PointsAnimation from "./points-animation"
import NextPuzzleCountdown from "./next-puzzle-countdown"
import CompactTopBar from "./compact-top-bar"
import FloatingGameControls from "./floating-game-controls"
import ModalOverlay from "./modal-overlay"
import WordFoundToast from "./word-found-toast"
import GameNotification from "./game-notification"
import ObjectiveCompleteNotification from "./objective-complete-notification"
import ShareResults from "./share-results"
import MiniAchievement from "./mini-achievement"
import LeaderboardButton from "./leaderboard-button"
import { IslandFeedback } from "./island-feedback"

const GameOverModal = lazy(() => import("./game-over-modal"))
const MobileSettingsSheet = lazy(() => import("./mobile-settings-sheet"))

export default function GameBoard() {
  const dispatch = useAppDispatch()

  const { isMobile, viewportHeight } = useViewport()

  // Selective state extraction
  const islands = useAppSelector((state) => state.game.islands)
  const selectedIslands = useAppSelector((state) => state.game.selectedIslands)
  const foundWords = useAppSelector((state) => state.game.foundWords)
  const score = useAppSelector((state) => state.game.score)
  const timeLeft = useAppSelector((state) => state.game.timeLeft)
  const gameActive = useAppSelector((state) => state.game.gameActive)
  const gameOver = useAppSelector((state) => state.game.gameOver)
  const objectives = useAppSelector((state) => state.game.objectives)
  const completedObjectives = useAppSelector((state) => state.game.completedObjectives)
  const theme = useAppSelector((state) => state.game.theme)
  const invalidSubmission = useAppSelector((state) => state.game.invalidSubmission)
  const duplicateSubmission = useAppSelector((state) => state.game.duplicateSubmission)
  const successfulSubmission = useAppSelector((state) => state.game.successfulSubmission)
  const comboCount = useAppSelector((state) => state.game.comboCount)
  const puzzleDate = useAppSelector((state) => state.game.gameTimestamp)
  const pointsAnimation = useAppSelector((state) => state.game.pointsAnimation)
  const bonusWords = useAppSelector((state) => state.game.bonusWords || [])

  useGameTimer(gameActive)
  usePuzzleChecker()

  // Local state
  const [showSettings, setShowSettings] = useState(false)
  const [showObjectivesModal, setShowObjectivesModal] = useState(false)
  const [showFoundWordsModal, setShowFoundWordsModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [wordFoundToast, setWordFoundToast] = useState({ word: "", points: 0, visible: false })
  const [showGameNotification, setShowGameNotification] = useState(false)
  const [miniAchievement, setMiniAchievement] = useState({ title: "", visible: false })
  const [invalidIslandClick, setInvalidIslandClick] = useState(false)
  const [invalidClickPosition, setInvalidClickPosition] = useState({ x: 0, y: 0 })
  const [allObjectivesNotificationShown, setAllObjectivesNotificationShown] = useState(false)

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const lastFoundWordRef = useRef<string>("")
  const lastScoreRef = useRef<number>(0)
  const currentWordRef = useRef<string>("")
  const prevCompletedObjectivesCountRef = useRef<number>(0)

  const onShowWordFoundToast = useEffectEvent((word: string, points: number) => {
    setWordFoundToast({
      word: word.toUpperCase(),
      points,
      visible: true,
    })
    lastFoundWordRef.current = word
    lastScoreRef.current = score
  })

  const onResetInvalidSubmission = useEffectEvent(() => {
    dispatch(resetInvalidSubmission())
  })

  const onShowMiniAchievement = useEffectEvent((title: string) => {
    setMiniAchievement({ title, visible: true })
  })

  // Show toast when a new word is found
  useEffect(() => {
    if (successfulSubmission && foundWords.length > 0) {
      const newWord = currentWordRef.current || foundWords[foundWords.length - 1]
      const pointsEarned = pointsAnimation.points > 0 ? pointsAnimation.points : score - lastScoreRef.current
      onShowWordFoundToast(newWord, pointsEarned)
    }
  }, [successfulSubmission, foundWords, score, pointsAnimation.points])

  // Handle invalid submission feedback
  useEffect(() => {
    if (invalidSubmission || duplicateSubmission) {
      const timer = setTimeout(() => {
        onResetInvalidSubmission()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [invalidSubmission, duplicateSubmission])

  const handlePointsAnimationComplete = () => {
    dispatch(hidePointsAnimation())
  }

  // Keyboard handlers
  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Enter" && selectedIslands.length > 0) {
      dispatch(submitWord())
    } else if (e.key === "Escape") {
      dispatch(resetSelection())
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const keyHandler = (e: KeyboardEvent) => handleKeyDown(e)
      window.addEventListener("keydown", keyHandler)
      return () => window.removeEventListener("keydown", keyHandler)
    }
  }, [])

  // Event handlers - React Compiler will optimize these
  const handleIslandClick = (id: string) => {
    if (gameActive) {
      dispatch(selectIsland(id))
    }
  }

  const handleIslandDoubleTap = (id: string) => {
    if (gameActive && selectedIslands.length > 0) {
      if (selectedIslands[selectedIslands.length - 1] === id) {
        dispatch(submitWord())
      }
    }
  }

  const handleSubmitWord = () => {
    const word = selectedIslands
      .map((id) => {
        const island = islands.find((i) => i.id === id)
        return island ? island.letter : ""
      })
      .join("")
      .toLowerCase()

    currentWordRef.current = word
    dispatch(submitWord())
  }

  const handleResetSelection = () => {
    dispatch(resetSelection())
  }

  const handleStartGame = () => {
    dispatch(startGame())
    lastScoreRef.current = 0
    lastFoundWordRef.current = ""
    currentWordRef.current = ""
    setAllObjectivesNotificationShown(false)
    prevCompletedObjectivesCountRef.current = 0
  }

  const handleResetGame = () => {
    dispatch(resetGame())
    lastScoreRef.current = 0
    lastFoundWordRef.current = ""
    currentWordRef.current = ""
    setAllObjectivesNotificationShown(false)
    prevCompletedObjectivesCountRef.current = 0
  }

  const handleResetGameAfterReview = () => {
    dispatch(resetGameAfterReview())
    lastScoreRef.current = 0
    lastFoundWordRef.current = ""
    currentWordRef.current = ""
    setAllObjectivesNotificationShown(false)
    prevCompletedObjectivesCountRef.current = 0
  }

  const handleSetGameTheme = (theme: GameTheme) => {
    dispatch(setGameTheme(theme))
  }

  const handleToggleSettings = () => {
    setShowSettings((prev) => !prev)
  }

  const handleShowObjectives = () => {
    setShowObjectivesModal(true)
  }

  const handleShowFoundWords = () => {
    setShowFoundWordsModal(true)
  }

  const handleShowShareModal = () => {
    setShowShareModal(true)
  }

  const handleCloseWordFoundToast = () => {
    setWordFoundToast((prev) => ({ ...prev, visible: false }))
  }

  const handlePreGameClick = () => {
    if (!gameActive) {
      handleStartGame()
    }
  }

  const handleCloseGameNotification = () => {
    setShowGameNotification(false)
  }

  const handleCloseMiniAchievement = () => {
    setMiniAchievement((prev) => ({ ...prev, visible: false }))
  }

  const currentWord = selectedIslands
    .map((id) => {
      const island = islands.find((i) => i.id === id)
      return island ? island.letter : ""
    })
    .join("")

  useEffect(() => {
    currentWordRef.current = currentWord.toLowerCase()
  }, [currentWord])

  const isWordValid = currentWord.length >= 2 && !foundWords.includes(currentWord.toLowerCase())

  const completedObjectivesCount = completedObjectives.length

  // Achievement tracking
  useEffect(() => {
    if (successfulSubmission && currentWordRef.current) {
      const newWord = currentWordRef.current

      if (foundWords.length === 1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Fires a transient achievement toast in reaction to the `successfulSubmission` Redux flag (an event, not derived state); gated by the flag so it runs once per submission.
        onShowMiniAchievement("First Word Found!")
      }

      if (newWord.length >= BONUS_WORD_MIN_LENGTH) {
        onShowMiniAchievement(`${newWord.length}-Letter Word!`)
      }

      if (comboCount >= COMBO_BONUS_THRESHOLD) {
        onShowMiniAchievement(`${comboCount}x Combo!`)
      }
    }

    if (
      completedObjectivesCount > 0 &&
      completedObjectivesCount === objectives.length &&
      !allObjectivesNotificationShown &&
      prevCompletedObjectivesCountRef.current !== completedObjectivesCount
    ) {
      onShowMiniAchievement("All Objectives Completed!")
      setAllObjectivesNotificationShown(true)
    }

    prevCompletedObjectivesCountRef.current = completedObjectivesCount
  }, [
    successfulSubmission,
    foundWords,
    comboCount,
    objectives,
    completedObjectivesCount,
    allObjectivesNotificationShown,
  ])

  // Game over is fully derived from game state — no effect/state needed.
  const showGameOver = !gameActive && timeLeft === 0

  const handleShareResults = () => {
    setShowShareModal(true)
  }

  const handleInvalidIslandClick = (event: React.MouseEvent, islandId: string) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setInvalidClickPosition({ x, y })
    setInvalidIslandClick(true)

    setTimeout(() => {
      setInvalidIslandClick(false)
    }, 1000)
  }

  const getHighestMultiplier = () => {
    if (!selectedIslands.length) return 1

    return selectedIslands
      .map((id) => islands.find((island) => island.id === id))
      .filter(Boolean)
      .reduce((max, island) => Math.max(max, island?.multiplier || 1), 1)
  }

  const highestMultiplier = getHighestMultiplier()

  return (
    <div className="flex flex-col transition-all duration-300" ref={gameAreaRef}>
      <AudioManager />
      <PointsAnimation
        points={pointsAnimation.points}
        isVisible={pointsAnimation.isVisible}
        onComplete={handlePointsAnimationComplete}
      />
      <ObjectiveCompleteNotification />

      <Activity mode={showGameNotification ? "visible" : "hidden"}>
        <GameNotification
          isVisible={showGameNotification}
          onClose={handleCloseGameNotification}
          message="Tap the Play button to start a game!"
        />
      </Activity>

      <WordFoundToast
        word={wordFoundToast.word}
        points={wordFoundToast.points}
        isVisible={wordFoundToast.visible}
        onClose={handleCloseWordFoundToast}
        comboCount={comboCount}
        multiplier={highestMultiplier}
      />
      <MiniAchievement
        title={miniAchievement.title}
        isVisible={miniAchievement.visible}
        onClose={handleCloseMiniAchievement}
      />
      <LeaderboardButton isVisible={!gameActive} />

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
          isMobile={isMobile}
          bonusWords={bonusWords}
        />
      )}

      {(gameActive || gameOver) && (
        <LiveWordDisplay
          currentWord={currentWord}
          isValid={isWordValid}
          invalidSubmission={invalidSubmission}
          duplicateSubmission={duplicateSubmission}
        />
      )}

      <div className="flex flex-col transition-all duration-300">
        {!gameActive && !gameOver && (
          <div className="mb-4">
            <NextPuzzleCountdown />
          </div>
        )}

        <div
          className="w-full mx-auto transition-all duration-300"
          style={{
            aspectRatio: "1/1",
            maxWidth: "600px",
            minHeight: "400px",
          }}
        >
          <div className="relative">
            <IslandFeedback isActive={invalidIslandClick} position={invalidClickPosition} />
            <IslandMap
              islands={islands}
              selectedIslands={selectedIslands}
              onIslandClick={handleIslandClick}
              onIslandDoubleTap={handleIslandDoubleTap}
              onPreGameClick={handlePreGameClick}
              theme={theme}
              invalidSubmission={invalidSubmission}
              successfulSubmission={successfulSubmission}
              onInvalidIslandClick={handleInvalidIslandClick}
              gameActive={gameActive || gameOver}
            />
          </div>
        </div>

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

      {!gameOver && (
        <FloatingGameControls
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
          onOpenSettings={handleToggleSettings}
          gameActive={gameActive}
        />
      )}

      <Activity mode={showGameOver ? "visible" : "hidden"}>
        <Suspense fallback={<div />}>
          <GameOverModal
            score={score}
            foundWords={foundWords}
            objectives={objectives}
            onResetGame={handleResetGameAfterReview}
            onShare={handleShareResults}
            puzzleDate={puzzleDate}
          />
        </Suspense>
      </Activity>

      <Activity mode={showSettings ? "visible" : "hidden"}>
        <Suspense fallback={<div />}>
          <MobileSettingsSheet
            isOpen={showSettings}
            onClose={handleToggleSettings}
            currentTheme={theme}
            onSetTheme={handleSetGameTheme}
          />
        </Suspense>
      </Activity>

      <ModalOverlay isOpen={showObjectivesModal} onClose={() => setShowObjectivesModal(false)} title="Objectives">
        <ObjectivesList objectives={objectives} />
      </ModalOverlay>

      <ModalOverlay isOpen={showFoundWordsModal} onClose={() => setShowFoundWordsModal(false)} title="Found Words">
        <FoundWordsList foundWords={foundWords} />
      </ModalOverlay>

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
