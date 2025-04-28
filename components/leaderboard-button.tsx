"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import ModalOverlay from "./modal-overlay"
import LeaderboardDisplay from "./leaderboard-display"

export default function LeaderboardButton() {
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowLeaderboard(true)}
        className="fixed bottom-20 left-4 z-40 bg-amber-500 hover:bg-amber-600 text-white h-10 w-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300"
        aria-label="View Leaderboard"
      >
        <Trophy size={18} />
      </button>

      <ModalOverlay isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="Leaderboard">
        <LeaderboardDisplay />
      </ModalOverlay>
    </>
  )
}
