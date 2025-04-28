import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { generateIslands } from "../utils/islandGenerator"
import { validateWord } from "../utils/wordValidator"
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
export type GameDuration = 120 | 300 | 600 // 2, 5, or 10 minutes

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
  gameDate: string
  // Properties
  comboCount: number
  lastWordTime: number
  comboTimeWindow: number
  invalidSubmission: boolean
  successfulSubmission: boolean
  theme: GameTheme
  gameDuration: GameDuration
  // New properties
  pointsAnimation: {
    points: number
    isVisible: boolean
  }
  requireAdjacent: boolean
  showWordDefinition: boolean
  wordDefinition: string
}

const today = new Date().toISOString().split("T")[0]
const seed = seedRandom(today)

// Generate islands first
const initialIslands = generateIslands(seed)

const initialState: GameState = {
  islands: initialIslands,
  selectedIslands: [],
  foundWords: [],
  score: 0,
  timeLeft: 120, // 2 minutes default
  gameActive: false,
  objectives: generateObjectives(seed, initialIslands),
  completedObjectives: [],
  message: "Select islands to form words!",
  gameDate: today,
  // Properties
  comboCount: 0,
  lastWordTime: 0,
  comboTimeWindow: 15000, // 15 seconds for combo
  invalidSubmission: false,
  successfulSubmission: false,
  theme: "tropical",
  gameDuration: 120,
  // New properties
  pointsAnimation: {
    points: 0,
    isVisible: false,
  },
  requireAdjacent: false,
  showWordDefinition: false,
  wordDefinition: "",
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
      } else if (state.requireAdjacent) {
        // If adjacent mode is on, enforce connection
        state.message = "Islands must be connected!"
      } else {
        // Double-check connection in both directions
        const targetIsland = state.islands.find((island) => island.id === islandId)
        if (targetIsland && targetIsland.connections.includes(lastSelectedId)) {
          // Connection exists in the other direction, so allow it
          if (state.selectedIslands.includes(islandId)) {
            state.message = "You've already selected this island!"
            return
          }

          state.selectedIslands.push(islandId)
          state.message = "Island selected!"
        } else {
          state.message = "Islands must be connected!"
        }
      }
    },

    submitWord: (state) => {
      // Reset visual feedback states
      state.invalidSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false

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

      if (state.foundWords.includes(word)) {
        state.message = "You've already found this word!"
        state.selectedIslands = []
        state.invalidSubmission = true
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

        if (newCompletedObjectives.length > 0) {
          newCompletedObjectives.forEach((objId) => {
            if (!state.completedObjectives.includes(objId)) {
              state.completedObjectives.push(objId)
              state.score += 50 // Bonus for completing an objective
            }
          })

          if (state.comboCount >= 3) {
            state.message = `Word found! +${wordScore} points (${comboBonus.toFixed(0)} combo bonus) and objective completed!`
          } else {
            state.message = `Word found! +${wordScore} points and objective completed!`
          }
        } else {
          if (state.comboCount >= 3) {
            state.message = `Word found! +${wordScore} points (${comboBonus.toFixed(0)} combo bonus)`
          } else {
            state.message = `Word found! +${wordScore} points`
          }
        }

        // Update objectives completion status
        state.objectives = state.objectives.map((obj) => ({
          ...obj,
          completed: state.completedObjectives.includes(obj.id),
        }))

        // Replace completed objectives with new ones
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
        state.message = "Not a valid word!"
        state.invalidSubmission = true
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
      // Check if it's a new day
      const today = new Date().toISOString().split("T")[0]

      if (today !== state.gameDate) {
        // It's a new day, reset everything with new seed
        const newSeed = seedRandom(today)
        state.islands = generateIslands(newSeed)
        state.objectives = generateObjectives(newSeed, state.islands)
        state.gameDate = today
        state.foundWords = []
        state.score = 0
      }

      state.timeLeft = state.gameDuration
      state.gameActive = true
      state.selectedIslands = []
      state.completedObjectives = []
      state.message = "Game started! Find words by connecting islands."
      state.comboCount = 0
      state.lastWordTime = 0
      state.invalidSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false

      // Reset completion status of objectives
      state.objectives = state.objectives.map((obj) => ({
        ...obj,
        completed: false,
      }))
    },

    resetGame: (state) => {
      // Keep the same islands and objectives (same day)
      state.selectedIslands = []
      state.foundWords = []
      state.score = 0
      state.timeLeft = state.gameDuration
      state.gameActive = false
      state.completedObjectives = []
      state.message = "Game reset! Press Start to play again."
      state.comboCount = 0
      state.lastWordTime = 0
      state.invalidSubmission = false
      state.successfulSubmission = false
      state.pointsAnimation.isVisible = false

      // Reset completion status of objectives
      state.objectives = state.objectives.map((obj) => ({
        ...obj,
        completed: false,
      }))
    },

    setGameDuration: (state, action: PayloadAction<GameDuration>) => {
      state.gameDuration = action.payload
      state.timeLeft = action.payload
    },

    setGameTheme: (state, action: PayloadAction<GameTheme>) => {
      state.theme = action.payload
    },

    setRequireAdjacent: (state, action: PayloadAction<boolean>) => {
      state.requireAdjacent = action.payload
    },

    hidePointsAnimation: (state) => {
      state.pointsAnimation.isVisible = false
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
  setGameDuration,
  setGameTheme,
  setRequireAdjacent,
  hidePointsAnimation,
} = gameSlice.actions

export default gameSlice.reducer
