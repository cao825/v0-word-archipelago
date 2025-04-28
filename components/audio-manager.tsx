"use client"

import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "@/lib/hooks/hooks"

// Create a type for the global audio controls
declare global {
  interface Window {
    gameAudio?: {
      toggleAudio: (enabled: boolean) => void
      toggleAmbient: (enabled: boolean) => void
      isAudioEnabled: () => boolean
      isAmbientEnabled: () => boolean
    }
  }
}

export default function AudioManager() {
  const { successfulSubmission, invalidSubmission, completedObjectives, selectedIslands } = useAppSelector(
    (state) => state.game,
  )
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [ambientEnabled, setAmbientEnabled] = useState(false)
  const prevSelectedLength = useRef(0)

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
    if (audioEnabled && typeof window !== "undefined") {
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

        // Only play ambient if enabled in settings
        if (ambientEnabled) {
          ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
        }
      }

      // Configure select sound to be quieter and shorter
      if (selectSoundRef.current) {
        selectSoundRef.current.volume = 0.3
      }
    }

    return () => {
      // Clean up audio elements
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause()
      }
    }
  }, [audioEnabled, ambientEnabled])

  // Toggle ambient sound based on settings
  useEffect(() => {
    if (audioEnabled && ambientSoundRef.current) {
      if (ambientEnabled) {
        ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
      } else {
        ambientSoundRef.current.pause()
      }
    }
  }, [audioEnabled, ambientEnabled])

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

  // Play a sound when an island is selected
  useEffect(() => {
    if (!audioEnabled || !selectSoundRef.current) return

    // Only play sound when a new island is selected (length increases)
    if (selectedIslands.length > prevSelectedLength.current) {
      selectSoundRef.current.currentTime = 0
      selectSoundRef.current.play().catch((e) => console.log("Select audio playback prevented:", e))
    }

    // Update the previous length reference
    prevSelectedLength.current = selectedIslands.length
  }, [selectedIslands.length, audioEnabled])

  // Expose methods to control audio settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.gameAudio = {
        toggleAudio: (enabled: boolean) => {
          setAudioEnabled(enabled)
        },
        toggleAmbient: (enabled: boolean) => {
          setAmbientEnabled(enabled)
        },
        isAudioEnabled: () => audioEnabled,
        isAmbientEnabled: () => ambientEnabled,
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.gameAudio = undefined
      }
    }
  }, [audioEnabled, ambientEnabled])

  return null // This component doesn't render anything
}
