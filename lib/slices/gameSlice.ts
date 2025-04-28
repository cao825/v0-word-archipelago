import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { generateIslands } from "../utils/islandGenerator"
import { validateWord } from "../services/dictionaryService"
import { generateObjectives, checkObjectives } from "../utils/objectiveGenerator"
import { seedRandom } from "../utils/seedRandom"

export interface Island {
  id: string
  letter: string
  position: { x: number; y: number }
  size: number
  connections: string[]
}

export interface Objective {
  id: string
  type: string
  description: string
  parameter: string | number
  completed: boolean
}

export type GameTheme = "tropical" | "sunset" | "stormy" | "volcanic"

interface GameState {
  islands: Island[]
  selectedIslands: string[]
  foundWords: string[]
  score: number
  timeLeft: number
  gameActive: boolean
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

const initialState: GameState = {
  islands: initialIslands,
  selectedIslands: [],
  foundWords: [],
  score: 0,
  timeLeft: 120, // Always 2 minutes
  gameActive: false,
  objectives: generateObjectives(seed, initialIslands),
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
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    selectIsland: (state, action: PayloadAction<string>) => {
      const islandId = action.payload

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

        // Calculate word score with combo multiplier
        let wordScore = word.length * 10
        let comboBonus = 0

        // Apply combo bonus for 3+ words in a row
        if (state.comboCount >= 3) {
          comboBonus = wordScore * (state.comboCount - 2) * 0.5 // 50% bonus per combo level above 2
          wordScore += comboBonus
        }

        state.score += wordScore
        state.foundWords.push(word)
        state.successfulSubmission = true

        // Set points animation
        state.pointsAnimation = {
          points: wordScore,
          isVisible: true,
        }

        // Check if any objectives were completed
        const newCompletedObjectives = checkObjectives(word, state.objectives, state.completedObjectives)
        console.log("[gameSlice] New completed objectives:", newCompletedObjectives)

        // Store objective check results for debugging
        state.debugInfo.lastObjectiveCheck = {
          word,
          objectives: JSON.parse(JSON.stringify(state.objectives)),
          completedBefore: [...state.completedObjectives],
          newlyCompleted: newCompletedObjectives,
        }

        if (newCompletedObjectives.length > 0) {
          // Add newly completed objectives to state
          const actuallyNewObjectives = newCompletedObjectives.filter(
            (objId) => !state.completedObjectives.includes(objId),
          )

          if (actuallyNewObjectives.length > 0) {
            console.log("[gameSlice] Actually new objectives:", actuallyNewObjectives)

            // Add to completed objectives array
            actuallyNewObjectives.forEach((objId) => {
              state.completedObjectives.push(objId)
              state.score += 50 // Bonus for completing an objective
            })

            console.log("[gameSlice] Updated completedObjectives:", state.completedObjectives)

            // Update objectives completion status immediately
            state.objectives = state.objectives.map((obj) => {
              const isCompleted = state.completedObjectives.includes(obj.id)
              console.log(`[gameSlice] Setting objective ${obj.id} completed: ${isCompleted}`)
              return {
                ...obj,
                completed: isCompleted,
              }
            })

            // Show objective completion notification
            state.objectiveCompletionNotification = {
              isVisible: true,
              count: actuallyNewObjectives.length,
              completedObjectiveIds: actuallyNewObjectives,
            }

            // Set appropriate message
            if (state.comboCount >= 3) {
              state.message = `Word found! +${wordScore} points (${comboBonus.toFixed(0)} combo bonus) and ${actuallyNewObjectives.length} objective${actuallyNewObjectives.length > 1 ? "s" : ""} completed!`
            } else {
              state.message = `Word found! +${wordScore} points and ${actuallyNewObjectives.length} objective${actuallyNewObjectives.length > 1 ? "s" : ""} completed!`
            }

            // Only generate new objectives to replace completed ones AFTER updating the UI
            // Find indices of completed objectives
            const completedObjectiveIndices = state.objectives
              .map((obj, index) => (obj.completed ? index : -1))
              .filter((index) => index !== -1)

            if (completedObjectiveIndices.length > 0) {
              // Generate new objectives to replace completed ones
              const newSeed = () => Math.random() // Simple random for new objectives
              const newObjectives = generateObjectives(newSeed, state.islands)

              // Replace completed objectives with new ones
              completedObjectiveIndices.forEach((index, i) => {
                if (i < newObjectives.length) {
                  state.objectives[index] = newObjectives[i]
                }
              })
            }
          } else {
            // No new objectives completed
            if (state.comboCount >= 3) {
              state.message = `Word found! +${wordScore} points (${comboBonus.toFixed(0)} combo bonus)`
            } else {
              state.message = `Word found! +${wordScore} points`
            }
          }
        } else {
          // No objectives completed
          if (state.comboCount >= 3) {
            state.message = `Word found! +${wordScore} points (${comboBonus.toFixed(0)} combo bonus)`
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

    resetSelection: (state) => {
      state.selectedIslands = []
      state.message = "Selection cleared!"
    },

    tickTimer: (state) => {
      if (state.gameActive && state.timeLeft > 0) {
        state.timeLeft -= 1

        if (state.timeLeft === 0) {
          state.gameActive = false
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
        state.islands = generateIslands(newSeed)
        state.objectives = generateObjectives(newSeed, state.islands)
        state.gameTimestamp = currentHourTimestamp
        state.foundWords = []
        state.score = 0
      }

      state.timeLeft = 120 // Always 2 minutes
      state.gameActive = true
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

      // Reset completion status of objectives
      state.objectives = state.objectives.map((obj) => ({
        ...obj,
        completed: false,
      }))
    },

    resetGame: (state) => {
      // Keep the same islands and objectives (same hour)
      state.selectedIslands = []
      state.foundWords = []
      state.score = 0
      state.timeLeft = 120 // Always 2 minutes
      state.gameActive = false
      state.completedObjectives = []
      state.message = "Game reset! Press Start to play again."
      state.comboCount = 0
      state.lastWordTime = 0
      state.invalidSubmission = false
      state.duplicateSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false
      state.objectiveCompletionNotification.isVisible = false
      state.objectiveCompletionNotification.completedObjectiveIds = []

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
        state.islands = generateIslands(newSeed)
        state.objectives = generateObjectives(newSeed, state.islands)
        state.gameTimestamp = currentHourTimestamp

        // Only reset game progress if the game is not active
        if (!state.gameActive) {
          state.foundWords = []
          state.score = 0
          state.selectedIslands = []
          state.completedObjectives = []
          state.message = "New puzzle available! Press Start to play."
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
  },
})

export const {
  selectIsland,
  submitWord,
  resetSelection,
  tickTimer,
  startGame,
  resetGame,
  setGameTheme,
  hidePointsAnimation,
  hideObjectiveNotification,
  checkForNewPuzzle,
  resetInvalidSubmission,
} = gameSlice.actions

const gameReducer = gameSlice.reducer

export default gameReducer

// Export the utility function for other components
export { getCurrentHourTimestamp }
