// Global type definitions
interface Window {
  gameAudio?: {
    toggleAudio: (enabled: boolean) => void
    toggleAmbient: (enabled: boolean) => void
    isAudioEnabled: () => boolean
    isAmbientEnabled: () => boolean
  }
  submitLeaderboardScore?: (
    playerInitials: string,
    score: number,
    wordsFound: number,
    objectivesCompleted: number,
  ) => boolean
}
