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

// Audio player interface that works with both HTML Audio and Web Audio API
interface AudioPlayer {
  play: () => Promise<void>
  pause?: () => void
  currentTime?: number
  volume?: number
}

// Create a Web Audio API based sound generator
const createWebAudioSound = (type: "success" | "error" | "objective" | "select" | "combo" | "ambient"): AudioPlayer => {
  // Only create AudioContext when needed to avoid autoplay restrictions
  let audioCtx: AudioContext | null = null

  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.warn("Web Audio API not supported")
        return null
      }
      audioCtx = new AudioContext()
    }
    return audioCtx
  }

  const play = async (): Promise<void> => {
    const ctx = getAudioContext()
    if (!ctx) return Promise.resolve()

    try {
      switch (type) {
        case "success":
          // High-pitched success sound
          playTone(ctx, 880, 0.2, 0.5)
          break
        case "error":
          // Low-pitched error sound
          playTone(ctx, 220, 0.2, 0.3)
          break
        case "objective":
          // Chord for objective completion
          playChord(ctx, [523.25, 659.25, 783.99], 0.1, 1.0)
          break
        case "combo":
          // Ascending notes for combo
          playAscending(ctx, [440, 554.37, 659.25], 0.15, 0.3)
          break
        case "select":
          // Click sound for selection
          playTone(ctx, 1200, 0.05, 0.1)
          break
        case "ambient":
          // Ambient ocean noise
          playAmbient(ctx)
          break
      }
      return Promise.resolve()
    } catch (error) {
      console.warn(`Error playing ${type} sound:`, error)
      return Promise.resolve()
    }
  }

  // Simple tone generator
  const playTone = (ctx: AudioContext, frequency: number, volume: number, duration: number) => {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  }

  // Chord player
  const playChord = (ctx: AudioContext, frequencies: number[], volume: number, duration: number) => {
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + i * 0.05)
      osc.stop(ctx.currentTime + duration)
    })
  }

  // Ascending notes player
  const playAscending = (ctx: AudioContext, frequencies: number[], volume: number, duration: number) => {
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(volume, ctx.currentTime + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.1 + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + i * 0.1)
      osc.stop(ctx.currentTime + i * 0.1 + duration)
    })
  }

  // Ambient sound generator
  let ambientSource: AudioBufferSourceNode | null = null
  let ambientGain: GainNode | null = null

  const playAmbient = (ctx: AudioContext) => {
    // Stop any existing ambient sound
    if (ambientSource) {
      try {
        ambientSource.stop()
      } catch (e) {
        // Ignore errors when stopping
      }
    }

    // Create white noise
    const bufferSize = 2 * ctx.sampleRate
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    ambientSource = ctx.createBufferSource()
    ambientSource.buffer = noiseBuffer
    ambientSource.loop = true

    const bandpass = ctx.createBiquadFilter()
    bandpass.type = "bandpass"
    bandpass.frequency.value = 500
    bandpass.Q.value = 0.5

    ambientGain = ctx.createGain()
    ambientGain.gain.value = 0.05

    ambientSource.connect(bandpass)
    bandpass.connect(ambientGain)
    ambientGain.connect(ctx.destination)

    ambientSource.start()
  }

  // Pause ambient sound
  const pause = () => {
    if (ambientSource) {
      try {
        ambientSource.stop()
        ambientSource = null
      } catch (e) {
        console.warn("Error stopping ambient sound:", e)
      }
    }
  }

  return {
    play,
    pause,
    currentTime: 0,
    volume: type === "select" ? 0.3 : 0.5,
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

  // Audio players
  const successSoundRef = useRef<AudioPlayer | null>(null)
  const errorSoundRef = useRef<AudioPlayer | null>(null)
  const objectiveSoundRef = useRef<AudioPlayer | null>(null)
  const comboSoundRef = useRef<AudioPlayer | null>(null)
  const selectSoundRef = useRef<AudioPlayer | null>(null)
  const ambientSoundRef = useRef<AudioPlayer | null>(null)

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

  // Set up audio players
  useEffect(() => {
    if (audioEnabled && typeof window !== "undefined") {
      // Create Web Audio API based sounds
      successSoundRef.current = createWebAudioSound("success")
      errorSoundRef.current = createWebAudioSound("error")
      objectiveSoundRef.current = createWebAudioSound("objective")
      comboSoundRef.current = createWebAudioSound("combo")
      selectSoundRef.current = createWebAudioSound("select")
      ambientSoundRef.current = createWebAudioSound("ambient")
    }

    return () => {
      // Clean up ambient sound
      if (ambientSoundRef.current && ambientSoundRef.current.pause) {
        try {
          ambientSoundRef.current.pause()
        } catch (error) {
          console.warn("Error pausing ambient sound during cleanup:", error)
        }
      }
    }
  }, [audioEnabled])

  // Toggle ambient sound based on settings
  useEffect(() => {
    if (audioEnabled && ambientSoundRef.current) {
      if (ambientEnabled) {
        try {
          ambientSoundRef.current.play().catch((err) => console.warn("Error playing ambient sound:", err))
        } catch (error) {
          console.warn("Error playing ambient sound:", error)
        }
      } else if (ambientSoundRef.current.pause) {
        try {
          ambientSoundRef.current.pause()
        } catch (error) {
          console.warn("Error pausing ambient sound:", error)
        }
      }
    }
  }, [audioEnabled, ambientEnabled])

  // Play sounds based on game state
  useEffect(() => {
    if (!audioEnabled) return

    if (successfulSubmission && successSoundRef.current) {
      try {
        successSoundRef.current.play().catch((err) => console.warn("Error playing success sound:", err))
      } catch (error) {
        console.warn("Error playing success sound:", error)
      }
    }
  }, [successfulSubmission, audioEnabled])

  useEffect(() => {
    if (!audioEnabled) return

    if (invalidSubmission && errorSoundRef.current) {
      try {
        errorSoundRef.current.play().catch((err) => console.warn("Error playing error sound:", err))
      } catch (error) {
        console.warn("Error playing error sound:", error)
      }
    }
  }, [invalidSubmission, audioEnabled])

  // Track completedObjectives to detect when new objectives are completed
  useEffect(() => {
    if (!audioEnabled || !objectiveSoundRef.current) return

    // Check if any new objectives were completed
    const newCompletedObjectives = completedObjectives.filter((id) => !prevCompletedObjectives.current.includes(id))

    if (newCompletedObjectives.length > 0) {
      try {
        objectiveSoundRef.current.play().catch((err) => console.warn("Error playing objective sound:", err))

        // Update the ref to the current completed objectives
        prevCompletedObjectives.current = [...completedObjectives]
      } catch (error) {
        console.warn("Error playing objective sound:", error)
      }
    }
  }, [completedObjectives, audioEnabled])

  // Play a sound when an island is selected
  useEffect(() => {
    if (!audioEnabled || !selectSoundRef.current) return

    // Only play sound when a new island is selected (length increases)
    if (selectedIslands.length > prevSelectedLength.current) {
      try {
        selectSoundRef.current.play().catch((err) => console.warn("Error playing select sound:", err))
      } catch (error) {
        console.warn("Error playing select sound:", error)
      }
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
