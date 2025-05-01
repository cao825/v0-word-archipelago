import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { generateIslands } from "../utils/islandGenerator"
import { validateWord } from "../services/dictionaryService"
import { generateObjectives, checkObjectives, type Objective } from "../utils/objectiveGenerator"
import { seedRandom } from "../utils/seedRandom"

export interface Island {
  id: string
  letter: string
  position: { x: number; y: number }
  size: number
  connections: string[]
  multiplier?: number // Add optional multiplier property
}

// Re-export the Objective type
export type { Objective }

export type GameTheme = "tropical" | "sunset" | "stormy" | "volcanic"

interface GameState {
  islands: Island[]
  selectedIslands: string[]
  foundWords: string[]
  score: number
  timeLeft: number
  gameActive: boolean
  gameOver: boolean // New state to track if game is over but board should remain visible
  objectives: Objective[]
  completedObjectives: string[]
  message: string
  gameTimestamp: string
  // Properties
  comboCount: number
  lastWordTime: number
  comboTimeWindow: number
  invalidSubmission: boolean
  duplicateSubmission: boolean
  successfulSubmission: boolean
  theme: GameTheme
  // New properties
  pointsAnimation: {
    points: number
    isVisible: boolean
  }
  showWordDefinition: boolean
  wordDefinition: string
  // Track objective completion notification
  objectiveCompletionNotification: {
    isVisible: boolean
    count: number
    completedObjectiveIds: string[]
  }
  // Debug info
  debugInfo: {
    lastWord: string
    lastObjectiveCheck: any
  }
  // Track invalid island selection
  invalidIslandSelection: string | null
  gameEndedButNotReset: boolean
  // Track if all objectives have been completed
  allObjectivesCompleted: boolean
  // Track bonus words
  bonusWords: string[]
  // Track if the game should preserve the final state
  preserveFinalState: boolean
}

// Get current hour timestamp (YYYY-MM-DD-HH format)
const getCurrentHourTimestamp = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}`
}

const hourlyTimestamp = getCurrentHourTimestamp()
const seed = seedRandom(hourlyTimestamp)

// Generate islands first
const initialIslands = generateIslands(seed)

// Make sure initialIslands is an array before passing to generateObjectives
const initialObjectives = Array.isArray(initialIslands) ? generateObjectives(seed, initialIslands) : []

const initialState: GameState = {
  islands: initialIslands || [],
  selectedIslands: [],
  foundWords: [],
  score: 0,
  timeLeft: 120, // Always 2 minutes
  gameActive: false,
  gameOver: false, // Initialize as false
  objectives: initialObjectives,
  completedObjectives: [],
  message: "Select islands to form words!",
  gameTimestamp: hourlyTimestamp,
  // Properties
  comboCount: 0,
  lastWordTime: 0,
  comboTimeWindow: 15000, // 15 seconds for combo
  invalidSubmission: false,
  duplicateSubmission: false,
  successfulSubmission: false,
  theme: "tropical",
  // New properties
  pointsAnimation: {
    points: 0,
    isVisible: false,
  },
  showWordDefinition: false,
  wordDefinition: "",
  // Track objective completion notification
  objectiveCompletionNotification: {
    isVisible: false,
    count: 0,
    completedObjectiveIds: [],
  },
  // Debug info
  debugInfo: {
    lastWord: "",
    lastObjectiveCheck: null,
  },
  // Track invalid island selection
  invalidIslandSelection: null,
  gameEndedButNotReset: false,
  // Track if all objectives have been completed
  allObjectivesCompleted: false,
  // Track bonus words
  bonusWords: [],
  // Track if the game should preserve the final state
  preserveFinalState: false,
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    selectIsland: (state, action: PayloadAction<string>) => {
      const islandId = action.payload

      // Reset invalid island selection
      state.invalidIslandSelection = null

      // If no islands selected yet, just add this one
      if (state.selectedIslands.length === 0) {
        state.selectedIslands.push(islandId)
        return
      }

      // Get the last selected island
      const lastSelectedId = state.selectedIslands[state.selectedIslands.length - 1]
      const lastSelected = state.islands.find((island) => island.id === lastSelectedId)

      // If trying to select the same island again, ignore
      if (islandId === lastSelectedId) {
        return
      }

      // If trying to deselect the previous island (backtracking one step)
      if (state.selectedIslands.length > 1 && islandId === state.selectedIslands[state.selectedIslands.length - 2]) {
        state.selectedIslands.pop()
        return
      }

      // Check if the new island is connected to the last selected island
      if (lastSelected && lastSelected.connections.includes(islandId)) {
        // Check if island is already in the path (except for backtracking)
        if (state.selectedIslands.includes(islandId)) {
          state.message = "You've already selected this island!"
          return
        }

        state.selectedIslands.push(islandId)
        state.message = "Island selected!"
      } else {
        // Islands must be connected - always enforce this rule
        state.message = "Islands must be connected!"
        // Mark this island as invalid for visual feedback
        state.invalidIslandSelection = islandId
      }
    },

    submitWord: (state) => {
      // Reset visual feedback states
      state.invalidSubmission = false
      state.duplicateSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false
      state.objectiveCompletionNotification.isVisible = false
      state.objectiveCompletionNotification.completedObjectiveIds = []

      if (state.selectedIslands.length < 2) {
        state.message = "Words must be at least 2 letters long!"
        state.invalidSubmission = true
        return
      }

      const word = state.selectedIslands
        .map((id) => {
          const island = state.islands.find((i) => i.id === id)
          return island ? island.letter : ""
        })
        .join("")
        .toLowerCase()

      // Store the word for debugging
      state.debugInfo.lastWord = word

      if (state.foundWords.includes(word)) {
        state.message = "You've already found this word!"
        state.selectedIslands = []
        state.duplicateSubmission = true
        return
      }

      const isValid = validateWord(word)

      if (isValid) {
        // Check for combo
        const now = Date.now()
        const timeSinceLastWord = now - state.lastWordTime

        // Update combo count if within time window
        if (state.lastWordTime > 0 && timeSinceLastWord < state.comboTimeWindow) {
          state.comboCount += 1
        } else {
          state.comboCount = 1
        }

        state.lastWordTime = now

        // Calculate base word score
        const baseWordScore = word.length * 10

        // Apply island multipliers if any
        const usedIslands = state.selectedIslands
          .map((id) => state.islands.find((island) => island.id === id))
          .filter(Boolean) as Island[]

        // Find the highest multiplier among used islands
        const highestMultiplier = usedIslands.reduce((max, island) => Math.max(max, island?.multiplier || 1), 1)

        // Apply the highest multiplier to the base score
        let wordScore = baseWordScore
        if (highestMultiplier > 1) {
          wordScore = baseWordScore * highestMultiplier
        }

        let comboBonus = 0

        // Apply combo bonus for 3+ words in a row
        if (state.comboCount >= 3) {
          comboBonus = Math.floor(baseWordScore * (state.comboCount - 2) * 0.5) // 50% bonus per combo level above 2
          wordScore += comboBonus
        }

        // Round the final score to an integer
        wordScore = Math.floor(wordScore)

        state.score += wordScore
        state.foundWords.push(word)
        state.successfulSubmission = true

        // Check if this is a bonus word (length >= 6)
        if (word.length >= 6) {
          state.bonusWords.push(word)
        }

        // Set points animation - IMPORTANT: This is what shows the points
        state.pointsAnimation = {
          points: wordScore,
          isVisible: true,
        }

        // Check if any objectives were completed
        const newCompletedObjectives = checkObjectives(word, state.objectives, state.completedObjectives)

        // Store objective check results for debugging
        state.debugInfo.lastObjectiveCheck = {
          word,
          objectives: JSON.parse(JSON.stringify(state.objectives)),
          completedBefore: [...state.completedObjectives],
          newlyCompleted: newCompletedObjectives,
        }

        // Only show objective completion notification if there are actually new completed objectives
        // AND we haven't already completed all objectives
        if (newCompletedObjectives && newCompletedObjectives.length > 0 && !state.allObjectivesCompleted) {
          // Update completed objectives array
          newCompletedObjectives.forEach((objId) => {
            if (!state.completedObjectives.includes(objId)) {
              state.completedObjectives.push(objId)
              state.score += 50 // Bonus for completing an objective
            }
          })

          // Update objectives completion status
          state.objectives = state.objectives.map((obj) => ({
            ...obj,
            completed: state.completedObjectives.includes(obj.id),
          }))

          // Check if all objectives are now completed - with double verification
          const actualCompletedCount = state.completedObjectives.length
          const totalObjectives = state.objectives.length
          if (actualCompletedCount > 0 && actualCompletedCount === totalObjectives) {
            // Double-check by counting objectives marked as completed
            const verifiedCompletedCount = state.objectives.filter((obj) =>
              state.completedObjectives.includes(obj.id),
            ).length
            state.allObjectivesCompleted = verifiedCompletedCount === totalObjectives
          } else {
            state.allObjectivesCompleted = false
          }

          // Show objective completion notification
          state.objectiveCompletionNotification = {
            isVisible: true,
            count: newCompletedObjectives.length,
            completedObjectiveIds: newCompletedObjectives,
          }

          // Set appropriate message
          if (state.comboCount >= 3) {
            state.message = `Word found! +${wordScore} points (${comboBonus} combo bonus) and ${newCompletedObjectives.length} objective${newCompletedObjectives.length > 1 ? "s" : ""} completed!`
          } else {
            state.message = `Word found! +${wordScore} points and ${newCompletedObjectives.length} objective${newCompletedObjectives.length > 1 ? "s" : ""} completed!`
          }
        } else {
          // No objectives completed
          if (state.comboCount >= 3) {
            state.message = `Word found! +${wordScore} points (${comboBonus} combo bonus)`
          } else if (highestMultiplier > 1) {
            state.message = `Word found! +${wordScore} points (${highestMultiplier}x multiplier)`
          } else {
            state.message = `Word found! +${wordScore} points`
          }
        }
      } else {
        state.message = "Not a valid word!"
        state.invalidSubmission = true
        // Reset combo count on invalid submission
        state.comboCount = 0
        state.lastWordTime = 0
      }

      state.selectedIslands = []
    },

    // Add this new reducer to handle hiding the points animation
    hidePointsAnimation: (state) => {
      state.pointsAnimation.isVisible = false
    },

    resetSelection: (state) => {
      state.selectedIslands = []
      state.message = "Selection cleared!"
    },

    tickTimer: (state) => {
      if (state.gameActive && state.timeLeft > 0) {
        state.timeLeft -= 1

        if (state.timeLeft === 0) {
          state.gameActive = false
          state.gameOver = true // Set gameOver to true instead of resetting
          state.preserveFinalState = true // Preserve the final state
          state.message = "Time's up!"
        }
      }
    },

    startGame: (state) => {
      // Check if it's a new hour
      const currentHourTimestamp = getCurrentHourTimestamp()

      if (currentHourTimestamp !== state.gameTimestamp) {
        // It's a new hour, reset everything with new seed
        const newSeed = seedRandom(currentHourTimestamp)
        const newIslands = generateIslands(newSeed)
        state.islands = newIslands || []

        // Make sure islands is an array before generating objectives
        if (Array.isArray(newIslands)) {
          state.objectives = generateObjectives(newSeed, newIslands)
        } else {
          state.objectives = []
          console.error("Failed to generate islands for new game")
        }

        state.gameTimestamp = currentHourTimestamp
        state.foundWords = []
        state.score = 0
      }

      state.timeLeft = 120 // Always 2 minutes
      state.gameActive = true
      state.gameOver = false // Reset gameOver state
      state.selectedIslands = []
      state.completedObjectives = []
      state.message = "Game started! Find words by connecting islands."
      state.comboCount = 0
      state.lastWordTime = 0
      state.invalidSubmission = false
      state.duplicateSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false
      state.objectiveCompletionNotification.isVisible = false
      state.objectiveCompletionNotification.completedObjectiveIds = []
      state.invalidIslandSelection = null
      state.gameEndedButNotReset = false
      state.allObjectivesCompleted = false // Reset the all objectives completed flag
      state.bonusWords = [] // Reset bonus words
      state.preserveFinalState = false // Reset preserve final state flag

      // Reset completion status of objectives
      state.objectives = state.objectives.map((obj) => ({
        ...obj,
        completed: false,
      }))
    },

    resetGame: (state) => {
      // Only reset the game state if we're not preserving the final state
      // or if we're explicitly resetting after game over
      if (!state.preserveFinalState || state.gameEndedButNotReset) {
        // Keep the same islands and objectives (same hour)
        state.selectedIslands = []
        state.foundWords = []
        state.score = 0
        state.timeLeft = 120 // Always 2 minutes
        state.gameActive = false
        state.gameOver = false // Reset gameOver state
        state.completedObjectives = []
        state.message = "Game reset! Press Start to play again."
        state.comboCount = 0
        state.lastWordTime = 0
        state.invalidSubmission = false
        state.duplicateSubmission = false
        state.successfulSubmission = false
        state.pointsAnimation.isVisible = false
        state.allObjectivesCompleted = false // Reset the all objectives completed flag
        state.bonusWords = [] // Reset bonus words
        state.preserveFinalState = false // Reset preserve final state flag

        // FIX: Set objectiveCompletionNotification to an object with the correct structure
        state.objectiveCompletionNotification = {
          isVisible: false,
          count: 0,
          completedObjectiveIds: [],
        }

        state.invalidIslandSelection = null
        state.gameEndedButNotReset = false

        // Reset completion status of objectives
        state.objectives = state.objectives.map((obj) => ({
          ...obj,
          completed: false,
        }))
      }
    },

    // Add a new action to explicitly reset the game after viewing the final state
    resetGameAfterReview: (state) => {
      // Force reset regardless of preserveFinalState
      state.selectedIslands = []
      state.foundWords = []
      state.score = 0
      state.timeLeft = 120
      state.gameActive = false
      state.gameOver = false
      state.completedObjectives = []
      state.message = "Game reset! Press Start to play again."
      state.comboCount = 0
      state.lastWordTime = 0
      state.invalidSubmission = false
      state.duplicateSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false
      state.allObjectivesCompleted = false
      state.bonusWords = []
      state.preserveFinalState = false

      state.objectiveCompletionNotification = {
        isVisible: false,
        count: 0,
        completedObjectiveIds: [],
      }

      state.invalidIslandSelection = null
      state.gameEndedButNotReset = false

      // Reset completion status of objectives
      state.objectives = state.objectives.map((obj) => ({
        ...obj,
        completed: false,
      }))
    },

    setGameTheme: (state, action: PayloadAction<GameTheme>) => {
      state.theme = action.payload
    },

    hidePointsAnimation: (state) => {
      state.pointsAnimation.isVisible = false
    },

    hideObjectiveNotification: (state) => {
      state.objectiveCompletionNotification.isVisible = false
    },

    checkForNewPuzzle: (state) => {
      const currentHourTimestamp = getCurrentHourTimestamp()

      if (currentHourTimestamp !== state.gameTimestamp) {
        // It's a new hour, reset everything with new seed
        const newSeed = seedRandom(currentHourTimestamp)
        const newIslands = generateIslands(newSeed)
        state.islands = newIslands || []

        // Make sure islands is an array before generating objectives
        if (Array.isArray(newIslands)) {
          state.objectives = generateObjectives(newSeed, newIslands)
        } else {
          state.objectives = []
          console.error("Failed to generate islands for new puzzle")
        }

        state.gameTimestamp = currentHourTimestamp

        // Only reset game progress if the game is not active
        if (!state.gameActive) {
          state.foundWords = []
          state.score = 0
          state.selectedIslands = []
          state.completedObjectives = []
          state.message = "New puzzle available! Press Start to play."
          state.allObjectivesCompleted = false // Reset the all objectives completed flag
          state.bonusWords = [] // Reset bonus words
        } else {
          // If game is active, show a message but don't interrupt gameplay
          state.message = "A new puzzle is available after this game!"
        }

        // Force a refresh of the UI by toggling a state
        state.invalidSubmission = false
        state.duplicateSubmission = false
        state.successfulSubmission = false
      }
    },
    resetInvalidSubmission: (state) => {
      state.invalidSubmission = false
      state.duplicateSubmission = false
    },
    clearInvalidIslandSelection: (state) => {
      state.invalidIslandSelection = null
    },
    endGame: (state) => {
      state.gameActive = false
      state.gameOver = true
      state.gameEndedButNotReset = true
      state.preserveFinalState = true // Preserve the final state when ending the game
    },
    resetAfterGameEnd: (state) => {
      // Now perform the actual reset
      state.gameEndedButNotReset = false
      state.islands = []
      state.selectedIslands = []
      state.foundWords = []
      state.score = 0
      state.objectives = []
      state.completedObjectives = []
      state.message = "Game reset! Press Start to play again."
      state.allObjectivesCompleted = false // Reset the all objectives completed flag
      state.bonusWords = [] // Reset bonus words
      state.preserveFinalState = false // Reset preserve final state flag
    },
  },
})

export const {
  selectIsland,
  submitWord,
  resetSelection,
  tickTimer,
  startGame,
  resetGame,
  resetGameAfterReview, // Export the new action
  setGameTheme,
  hidePointsAnimation,
  hideObjectiveNotification,
  checkForNewPuzzle,
  resetInvalidSubmission,
  clearInvalidIslandSelection,
  endGame,
  resetAfterGameEnd,
} = gameSlice.actions

const gameReducer = gameSlice.reducer

export default gameReducer

// Export the utility function for other components
export { getCurrentHourTimestamp }
