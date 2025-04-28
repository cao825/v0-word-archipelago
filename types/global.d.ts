interface Window {
  submitLeaderboardScore: (
    playerInitials: string,
    score: number,
    wordsFound: number,
    objectivesCompleted: number,
  ) => boolean
  refreshLeaderboardDisplay: () => void
}
