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
  const prevCompletedObjectives = useRef<string[]>([])

  // Audio refs
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)
  const objectiveSoundRef = useRef<HTMLAudioElement | null>(null)
  const comboSoundRef = useRef<HTMLAudioElement | null>(null)
  const selectSoundRef = useRef<HTMLAudioElement | null>(null)
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null)

  // Audio loading state
  const [audioLoaded, setAudioLoaded] = useState({
    success: false,
    error: false,
    objective: false,
    combo: false,
    select: false,
    ambient: false,
  })

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
      // Create audio elements with proper error handling
      const createAudio = (src: string, onLoad: () => void, onError: (e: ErrorEvent) => void) => {
        const audio = new Audio()
        audio.addEventListener("canplaythrough", onLoad)
        audio.addEventListener("error", onError)
        audio.src = src
        return audio
      }

      // Create success sound
      successSoundRef.current = createAudio(
        "/sounds/success.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, success: true })),
        (e) => console.error("Failed to load success sound:", e),
      )

      // Create error sound
      errorSoundRef.current = createAudio(
        "/sounds/error.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, error: true })),
        (e) => console.error("Failed to load error sound:", e),
      )

      // Create objective sound
      objectiveSoundRef.current = createAudio(
        "/sounds/objective.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, objective: true })),
        (e) => console.error("Failed to load objective sound:", e),
      )

      // Create combo sound
      comboSoundRef.current = createAudio(
        "/sounds/combo.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, combo: true })),
        (e) => console.error("Failed to load combo sound:", e),
      )

      // Create select sound
      selectSoundRef.current = createAudio(
        "/sounds/select.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, select: true })),
        (e) => console.error("Failed to load select sound:", e),
      )

      // Create ambient sound
      ambientSoundRef.current = createAudio(
        "/sounds/ocean-waves.mp3",
        () => {
          setAudioLoaded((prev) => ({ ...prev, ambient: true }))
          if (ambientEnabled && ambientSoundRef.current) {
            ambientSoundRef.current.loop = true
            ambientSoundRef.current.volume = 0.2
            ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
          }
        },
        (e) => console.error("Failed to load ambient sound:", e),
      )

      // Configure select sound to be quieter
      if (selectSoundRef.current) {
        selectSoundRef.current.volume = 0.3
      }
    }

    return () => {
      // Clean up audio elements
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause()
        ambientSoundRef.current.removeEventListener("canplaythrough", () => {})
        ambientSoundRef.current.removeEventListener("error", () => {})
      }
      if (successSoundRef.current) {
        successSoundRef.current.removeEventListener("canplaythrough", () => {})
        successSoundRef.current.removeEventListener("error", () => {})
      }
      if (errorSoundRef.current) {
        errorSoundRef.current.removeEventListener("canplaythrough", () => {})
        errorSoundRef.current.removeEventListener("error", () => {})
      }
      if (objectiveSoundRef.current) {
        objectiveSoundRef.current.removeEventListener("canplaythrough", () => {})
        objectiveSoundRef.current.removeEventListener("error", () => {})
      }
      if (comboSoundRef.current) {
        comboSoundRef.current.removeEventListener("canplaythrough", () => {})
        comboSoundRef.current.removeEventListener("error", () => {})
      }
      if (selectSoundRef.current) {
        selectSoundRef.current.removeEventListener("canplaythrough", () => {})
        selectSoundRef.current.removeEventListener("error", () => {})
      }
    }
  }, [audioEnabled, ambientEnabled])

  // Toggle ambient sound based on settings
  useEffect(() => {
    if (audioEnabled && ambientSoundRef.current && audioLoaded.ambient) {
      if (ambientEnabled) {
        ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
      } else {
        ambientSoundRef.current.pause()
      }
    }
  }, [audioEnabled, ambientEnabled, audioLoaded.ambient])

  // Play sounds based on game state
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.success) return

    if (successfulSubmission && successSoundRef.current) {
      successSoundRef.current.currentTime = 0
      successSoundRef.current.play().catch((e) => console.log("Success audio playback prevented:", e))
    }
  }, [successfulSubmission, audioEnabled, audioLoaded.success])

  useEffect(() => {
    if (!audioEnabled || !audioLoaded.error) return

    if (invalidSubmission && errorSoundRef.current) {
      errorSoundRef.current.currentTime = 0
      errorSoundRef.current.play().catch((e) => console.log("Error audio playback prevented:", e))
    }
  }, [invalidSubmission, audioEnabled, audioLoaded.error])

  // Track completedObjectives.length to detect when new objectives are completed
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.objective || !objectiveSoundRef.current) return

    // Check if any new objectives were completed
    const newCompletedObjectives = completedObjectives.filter((id) => !prevCompletedObjectives.current.includes(id))

    if (newCompletedObjectives.length > 0) {
      objectiveSoundRef.current.currentTime = 0
      objectiveSoundRef.current.play().catch((e) => console.log("Objective audio playback prevented:", e))

      // Update the ref to the current completed objectives
      prevCompletedObjectives.current = [...completedObjectives]
    }
  }, [completedObjectives, audioEnabled, audioLoaded.objective])

  // Play a sound when an island is selected
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.select || !selectSoundRef.current) return

    // Only play sound when a new island is selected (length increases)
    if (selectedIslands.length > prevSelectedLength.current) {
      selectSoundRef.current.currentTime = 0
      selectSoundRef.current.play().catch((e) => console.log("Select audio playback prevented:", e))
    }

    // Update the previous length reference
    prevSelectedLength.current = selectedIslands.length
  }, [selectedIslands.length, audioEnabled, audioLoaded.select])

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

  // Add placeholder audio files if they don't exist
  useEffect(() => {
    // Check if audio files exist
    const checkAudioFiles = async () => {
      try {
        const files = [
          "/sounds/success.mp3",
          "/sounds/error.mp3",
          "/sounds/objective.mp3",
          "/sounds/combo.mp3",
          "/sounds/select.mp3",
          "/sounds/ocean-waves.mp3",
        ]

        for (const file of files) {
          const response = await fetch(file, { method: "HEAD" })
          if (!response.ok) {
            console.warn(`Audio file ${file} not found or inaccessible`)
          }
        }
      } catch (error) {
        console.error("Error checking audio files:", error)
      }
    }

    checkAudioFiles()
  }, [])

  return null // This component doesn't render anything
}
