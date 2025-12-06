"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import ModalOverlay from "./modal-overlay"
import LeaderboardDisplay from "./leaderboard-display"

interface LeaderboardButtonProps {
  isVisible?: boolean
}

export default function LeaderboardButton({ isVisible = true }: LeaderboardButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isVisible) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-4 z-10 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
        aria-label="View Leaderboard"
      >
        <Trophy className="h-5 w-5" />
      </button>

      <ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)} title="Leaderboard">
        <LeaderboardDisplay />
      </ModalOverlay>
    </>
  )
}
