"use client"

import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "@/lib/hooks/hooks"

export default function AudioManager() {
  const { successfulSubmission, invalidSubmission, completedObjectives } = useAppSelector((state) => state.game)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Audio refs
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)
  const objectiveSoundRef = useRef<HTMLAudioElement | null>(null)
  const comboSoundRef = useRef<HTMLAudioElement | null>(null)
  const selectSoundRef = useRef<HTMLAudioElement | null>(null)
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      setAudioEnabled(true)
      document.removeEventListener("click", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
    }
  }, [])

  // Set up audio elements
  useEffect(() => {
    if (audioEnabled) {
      // Create audio elements
      successSoundRef.current = new Audio("/sounds/success.mp3")
      errorSoundRef.current = new Audio("/sounds/error.mp3")
      objectiveSoundRef.current = new Audio("/sounds/objective.mp3")
      comboSoundRef.current = new Audio("/sounds/combo.mp3")
      selectSoundRef.current = new Audio("/sounds/select.mp3")
      ambientSoundRef.current = new Audio("/sounds/ocean-waves.mp3")

      // Configure ambient sound
      if (ambientSoundRef.current) {
        ambientSoundRef.current.loop = true
        ambientSoundRef.current.volume = 0.2
        ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
      }
    }

    return () => {
      // Clean up audio elements
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause()
      }
    }
  }, [audioEnabled])

  // Play sounds based on game state
  useEffect(() => {
    if (!audioEnabled) return

    if (successfulSubmission && successSoundRef.current) {
      successSoundRef.current.currentTime = 0
      successSoundRef.current.play().catch((e) => console.log("Success audio playback prevented:", e))
    }
  }, [successfulSubmission, audioEnabled])

  useEffect(() => {
    if (!audioEnabled) return

    if (invalidSubmission && errorSoundRef.current) {
      errorSoundRef.current.currentTime = 0
      errorSoundRef.current.play().catch((e) => console.log("Error audio playback prevented:", e))
    }
  }, [invalidSubmission, audioEnabled])

  // We're using completedObjectives.length as a dependency to detect when objectives are completed
  useEffect(() => {
    if (!audioEnabled) return

    if (completedObjectives.length > 0 && objectiveSoundRef.current) {
      objectiveSoundRef.current.currentTime = 0
      objectiveSoundRef.current.play().catch((e) => console.log("Objective audio playback prevented:", e))
    }
  }, [completedObjectives.length, audioEnabled])

  return null // This component doesn't render anything
}
