"use client"

import type React from "react"

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
      const createAudio = (src: string, onLoad: () => void, onError: (e: Event) => void) => {
        const audio = new Audio()
        audio.addEventListener("canplaythrough", onLoad, { once: true })
        audio.addEventListener("error", onError, { once: true })

        // Add a timeout to handle cases where the file might be slow to load
        const timeout = setTimeout(() => {
          console.warn(`Audio file ${src} loading timed out, continuing without it`)
          onLoad() // Mark as loaded anyway to prevent blocking
        }, 3000)

        // Clear timeout when loaded
        audio.addEventListener("canplaythrough", () => clearTimeout(timeout), { once: true })

        // Set the source last to start loading
        audio.src = src
        return audio
      }

      // Create success sound with fallback
      successSoundRef.current = createAudio(
        "/sounds/success.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, success: true })),
        (e) => {
          console.warn("Failed to load success sound, using fallback", e)
          // Create a simple beep as fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = ctx.createOscillator()
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
          oscillator.connect(ctx.destination)

          // Store the context and oscillator for later use
          const fallbackAudio = {
            ctx,
            oscillator,
            play: () => {
              const osc = ctx.createOscillator()
              osc.type = "sine"
              osc.frequency.setValueAtTime(880, ctx.currentTime)

              const gain = ctx.createGain()
              gain.gain.setValueAtTime(0.2, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)

              osc.connect(gain)
              gain.connect(ctx.destination)

              osc.start()
              osc.stop(ctx.currentTime + 0.5)
            },
            currentTime: 0,
          }

          // Replace the audio element with our fallback
          successSoundRef.current = fallbackAudio as any
          setAudioLoaded((prev) => ({ ...prev, success: true }))
        },
      )

      // Create error sound
      errorSoundRef.current = createAudio(
        "/sounds/error.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, error: true })),
        (e) => {
          console.warn("Failed to load error sound, using fallback", e)
          // Create a simple lower beep as fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const fallbackAudio = {
            ctx,
            play: () => {
              const osc = ctx.createOscillator()
              osc.type = "sine"
              osc.frequency.setValueAtTime(220, ctx.currentTime) // A3

              const gain = ctx.createGain()
              gain.gain.setValueAtTime(0.2, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)

              osc.connect(gain)
              gain.connect(ctx.destination)

              osc.start()
              osc.stop(ctx.currentTime + 0.3)
            },
            currentTime: 0,
          }

          // Replace the audio element with our fallback
          errorSoundRef.current = fallbackAudio as any
          setAudioLoaded((prev) => ({ ...prev, error: true }))
        },
      )

      // Create objective sound
      objectiveSoundRef.current = createAudio(
        "/sounds/objective.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, objective: true })),
        (e) => {
          console.warn("Failed to load objective sound, using fallback", e)
          // Create a simple chord as fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const fallbackAudio = {
            ctx,
            play: () => {
              const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5

              frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                osc.type = "sine"
                osc.frequency.setValueAtTime(freq, ctx.currentTime)

                const gain = ctx.createGain()
                gain.gain.setValueAtTime(0.1, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0)

                osc.connect(gain)
                gain.connect(ctx.destination)

                osc.start(ctx.currentTime + i * 0.05)
                osc.stop(ctx.currentTime + 1.0)
              })
            },
            currentTime: 0,
          }

          // Replace the audio element with our fallback
          objectiveSoundRef.current = fallbackAudio as any
          setAudioLoaded((prev) => ({ ...prev, objective: true }))
        },
      )

      // Create combo sound
      comboSoundRef.current = createAudio(
        "/sounds/combo.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, combo: true })),
        (e) => {
          console.warn("Failed to load combo sound, using fallback", e)
          // Create a simple ascending notes as fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const fallbackAudio = {
            ctx,
            play: () => {
              const frequencies = [440, 554.37, 659.25] // A4, C#5, E5

              frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                osc.type = "sine"
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)

                const gain = ctx.createGain()
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1)
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.1 + 0.3)

                osc.connect(gain)
                gain.connect(ctx.destination)

                osc.start(ctx.currentTime + i * 0.1)
                osc.stop(ctx.currentTime + i * 0.1 + 0.3)
              })
            },
            currentTime: 0,
          }

          // Replace the audio element with our fallback
          comboSoundRef.current = fallbackAudio as any
          setAudioLoaded((prev) => ({ ...prev, combo: true }))
        },
      )

      // Create select sound
      selectSoundRef.current = createAudio(
        "/sounds/select.mp3",
        () => setAudioLoaded((prev) => ({ ...prev, select: true })),
        (e) => {
          console.warn("Failed to load select sound, using fallback", e)
          // Create a simple click as fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const fallbackAudio = {
            ctx,
            play: () => {
              const osc = ctx.createOscillator()
              osc.type = "sine"
              osc.frequency.setValueAtTime(1200, ctx.currentTime)

              const gain = ctx.createGain()
              gain.gain.setValueAtTime(0.05, ctx.currentTime)
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1)

              osc.connect(gain)
              gain.connect(ctx.destination)

              osc.start()
              osc.stop(ctx.currentTime + 0.1)
            },
            currentTime: 0,
            volume: 0.3,
          }

          // Replace the audio element with our fallback
          selectSoundRef.current = fallbackAudio as any
          setAudioLoaded((prev) => ({ ...prev, select: true }))
        },
      )

      // Create ambient sound
      ambientSoundRef.current = createAudio(
        "/sounds/ocean-waves.mp3",
        () => {
          setAudioLoaded((prev) => ({ ...prev, ambient: true }))
          if (ambientEnabled && ambientSoundRef.current && "loop" in ambientSoundRef.current) {
            ambientSoundRef.current.loop = true
            ambientSoundRef.current.volume = 0.2
            ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
          }
        },
        (e) => {
          console.warn("Failed to load ambient sound, using fallback", e)
          // Create a simple ambient noise as fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          let isPlaying = false

          const fallbackAudio = {
            ctx,
            loop: false,
            volume: 0.2,
            play: () => {
              if (isPlaying) return Promise.resolve()
              isPlaying = true

              // Create white noise
              const bufferSize = 2 * ctx.sampleRate
              const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
              const output = noiseBuffer.getChannelData(0)

              for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1
              }

              const whiteNoise = ctx.createBufferSource()
              whiteNoise.buffer = noiseBuffer
              whiteNoise.loop = true

              const bandpass = ctx.createBiquadFilter()
              bandpass.type = "bandpass"
              bandpass.frequency.value = 500
              bandpass.Q.value = 0.5

              const gain = ctx.createGain()
              gain.gain.value = 0.05

              whiteNoise.connect(bandpass)
              bandpass.connect(gain)
              gain.connect(ctx.destination)

              whiteNoise.start()

              // Store for stopping later
              fallbackAudio._source = whiteNoise
              fallbackAudio._gain = gain

              return Promise.resolve()
            },
            pause: () => {
              if (!isPlaying) return
              isPlaying = false

              if (fallbackAudio._source) {
                fallbackAudio._source.stop()
                fallbackAudio._source = null
              }
            },
            _source: null,
            _gain: null,
            currentTime: 0,
          }

          // Replace the audio element with our fallback
          ambientSoundRef.current = fallbackAudio as any
          setAudioLoaded((prev) => ({ ...prev, ambient: true }))

          if (ambientEnabled) {
            fallbackAudio.play().catch((e) => console.log("Ambient fallback playback prevented:", e))
          }
        },
      )

      // Configure select sound to be quieter
      if (selectSoundRef.current && "volume" in selectSoundRef.current) {
        selectSoundRef.current.volume = 0.3
      }
    }

    return () => {
      // Clean up audio elements
      if (ambientSoundRef.current) {
        if ("pause" in ambientSoundRef.current) {
          ambientSoundRef.current.pause()
        }
        if ("removeEventListener" in ambientSoundRef.current) {
          ambientSoundRef.current.removeEventListener("canplaythrough", () => {})
          ambientSoundRef.current.removeEventListener("error", () => {})
        }
      }

      // Clean up other audio elements
      const cleanupAudio = (ref: React.MutableRefObject<any>) => {
        if (ref.current && "removeEventListener" in ref.current) {
          ref.current.removeEventListener("canplaythrough", () => {})
          ref.current.removeEventListener("error", () => {})
        }
      }

      cleanupAudio(successSoundRef)
      cleanupAudio(errorSoundRef)
      cleanupAudio(objectiveSoundRef)
      cleanupAudio(comboSoundRef)
      cleanupAudio(selectSoundRef)
    }
  }, [audioEnabled, ambientEnabled])

  // Toggle ambient sound based on settings
  useEffect(() => {
    if (audioEnabled && ambientSoundRef.current && audioLoaded.ambient) {
      if (ambientEnabled) {
        if ("play" in ambientSoundRef.current) {
          ambientSoundRef.current.play().catch((e) => console.log("Ambient audio playback prevented:", e))
        }
      } else {
        if ("pause" in ambientSoundRef.current) {
          ambientSoundRef.current.pause()
        }
      }
    }
  }, [audioEnabled, ambientEnabled, audioLoaded.ambient])

  // Play sounds based on game state
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.success) return

    if (successfulSubmission && successSoundRef.current && "play" in successSoundRef.current) {
      if ("currentTime" in successSoundRef.current) {
        successSoundRef.current.currentTime = 0
      }
      successSoundRef.current.play().catch((e) => console.log("Success audio playback prevented:", e))
    }
  }, [successfulSubmission, audioEnabled, audioLoaded.success])

  useEffect(() => {
    if (!audioEnabled || !audioLoaded.error) return

    if (invalidSubmission && errorSoundRef.current && "play" in errorSoundRef.current) {
      if ("currentTime" in errorSoundRef.current) {
        errorSoundRef.current.currentTime = 0
      }
      errorSoundRef.current.play().catch((e) => console.log("Error audio playback prevented:", e))
    }
  }, [invalidSubmission, audioEnabled, audioLoaded.error])

  // Track completedObjectives.length to detect when new objectives are completed
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.objective || !objectiveSoundRef.current || !("play" in objectiveSoundRef.current))
      return

    // Check if any new objectives were completed
    const newCompletedObjectives = completedObjectives.filter((id) => !prevCompletedObjectives.current.includes(id))

    if (newCompletedObjectives.length > 0) {
      if ("currentTime" in objectiveSoundRef.current) {
        objectiveSoundRef.current.currentTime = 0
      }
      objectiveSoundRef.current.play().catch((e) => console.log("Objective audio playback prevented:", e))

      // Update the ref to the current completed objectives
      prevCompletedObjectives.current = [...completedObjectives]
    }
  }, [completedObjectives, audioEnabled, audioLoaded.objective])

  // Play a sound when an island is selected
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.select || !selectSoundRef.current || !("play" in selectSoundRef.current)) return

    // Only play sound when a new island is selected (length increases)
    if (selectedIslands.length > prevSelectedLength.current) {
      if ("currentTime" in selectSoundRef.current) {
        selectSoundRef.current.currentTime = 0
      }
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
