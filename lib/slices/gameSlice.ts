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

export type GameTheme = "tropical" | "sunset" | "stormy"
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
  // New properties
  comboCount: number
  lastWordTime: number
  comboTimeWindow: number
  invalidSubmission: boolean
  successfulSubmission: boolean
  theme: GameTheme
  gameDuration: GameDuration
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
  // New properties
  comboCount: 0,
  lastWordTime: 0,
  comboTimeWindow: 15000, // 15 seconds for combo
  invalidSubmission: false,
  successfulSubmission: false,
  theme: "tropical",
  gameDuration: 120,
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

        // Check if all objectives are completed and generate new ones if needed
        const allCompleted = state.objectives.every((obj) => obj.completed)
        if (allCompleted && state.gameActive) {
          // Generate new objectives
          const newSeed = () => Math.random() // Simple random for new objectives
          const newObjectives = generateObjectives(newSeed, state.islands)

          // Add new objectives to the list
          state.objectives = [...state.objectives, ...newObjectives]

          state.message += " New objectives added!"
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
} = gameSlice.actions

export default gameSlice.reducer
