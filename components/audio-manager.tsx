"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "@/lib/hooks/hooks"
import { preloadAudioFiles } from "@/lib/utils/audioUtils"

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

// Safe promise handler
const safePromise = (promise: Promise<any> | undefined) => {
  if (!promise || typeof promise.then !== "function") return Promise.resolve()
  return promise.catch((err) => console.log("Audio promise rejected:", err))
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
    const handleFirstInteraction = async () => {
      setAudioEnabled(true)

      // Preload audio files to check availability
      const availableFiles = await preloadAudioFiles()
      console.log("Audio files availability:", availableFiles)

      document.removeEventListener("click", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
    }
  }, [])

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
        try {
          // Use a relative path that works in both development and production
          const response = await fetch(file, { method: "HEAD" })
          if (!response.ok) {
            console.warn(`Audio file ${file} not found or inaccessible, will use fallback`)
          }
        } catch (error) {
          console.warn(`Error checking audio file ${file}, will use fallback:`, error)
        }
      }
    } catch (error) {
      console.error("Error checking audio files:", error)
    }
  }

  // Set up audio elements
  useEffect(() => {
    if (audioEnabled && typeof window !== "undefined") {
      // Create audio elements with proper error handling
      const createAudio = (src: string, onLoad: () => void, onError: (e: Event) => void) => {
        try {
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

          // Make sure we're using a relative path that works in both dev and production
          const relativeSrc = src.startsWith("/") ? src : `/${src}`

          // Set the source last to start loading
          audio.src = relativeSrc
          return audio
        } catch (error) {
          console.error(`Error creating audio for ${src}:`, error)
          onLoad() // Mark as loaded to prevent blocking
          return null
        }
      }

      // Create success sound with fallback
      try {
        successSoundRef.current = createAudio(
          "/sounds/success.mp3",
          () => setAudioLoaded((prev) => ({ ...prev, success: true })),
          (e) => {
            console.warn("Failed to load success sound, using fallback", e)
            // Create a simple beep as fallback
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
              const fallbackAudio = {
                ctx,
                play: () => {
                  try {
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
                    return Promise.resolve()
                  } catch (error) {
                    console.warn("Error playing fallback success sound:", error)
                    return Promise.resolve()
                  }
                },
                currentTime: 0,
              }

              // Replace the audio element with our fallback
              successSoundRef.current = fallbackAudio as any
              setAudioLoaded((prev) => ({ ...prev, success: true }))
            } catch (error) {
              console.warn("Could not create fallback audio:", error)
              setAudioLoaded((prev) => ({ ...prev, success: true }))
            }
          },
        )
      } catch (error) {
        console.error("Error setting up success sound:", error)
        setAudioLoaded((prev) => ({ ...prev, success: true }))
      }

      // Create error sound
      try {
        errorSoundRef.current = createAudio(
          "/sounds/error.mp3",
          () => setAudioLoaded((prev) => ({ ...prev, error: true })),
          (e) => {
            console.warn("Failed to load error sound, using fallback", e)
            try {
              // Create a simple lower beep as fallback
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
              const fallbackAudio = {
                ctx,
                play: () => {
                  try {
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
                    return Promise.resolve()
                  } catch (error) {
                    console.warn("Error playing fallback error sound:", error)
                    return Promise.resolve()
                  }
                },
                currentTime: 0,
              }

              // Replace the audio element with our fallback
              errorSoundRef.current = fallbackAudio as any
              setAudioLoaded((prev) => ({ ...prev, error: true }))
            } catch (error) {
              console.warn("Could not create fallback audio:", error)
              setAudioLoaded((prev) => ({ ...prev, error: true }))
            }
          },
        )
      } catch (error) {
        console.error("Error setting up error sound:", error)
        setAudioLoaded((prev) => ({ ...prev, error: true }))
      }

      // Create objective sound
      try {
        objectiveSoundRef.current = createAudio(
          "/sounds/objective.mp3",
          () => setAudioLoaded((prev) => ({ ...prev, objective: true })),
          (e) => {
            console.warn("Failed to load objective sound, using fallback", e)
            try {
              // Create a simple chord as fallback
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
              const fallbackAudio = {
                ctx,
                play: () => {
                  try {
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
                    return Promise.resolve()
                  } catch (error) {
                    console.warn("Error playing fallback objective sound:", error)
                    return Promise.resolve()
                  }
                },
                currentTime: 0,
              }

              // Replace the audio element with our fallback
              objectiveSoundRef.current = fallbackAudio as any
              setAudioLoaded((prev) => ({ ...prev, objective: true }))
            } catch (error) {
              console.warn("Could not create fallback audio:", error)
              setAudioLoaded((prev) => ({ ...prev, objective: true }))
            }
          },
        )
      } catch (error) {
        console.error("Error setting up objective sound:", error)
        setAudioLoaded((prev) => ({ ...prev, objective: true }))
      }

      // Create combo sound
      try {
        comboSoundRef.current = createAudio(
          "/sounds/combo.mp3",
          () => setAudioLoaded((prev) => ({ ...prev, combo: true })),
          (e) => {
            console.warn("Failed to load combo sound, using fallback", e)
            try {
              // Create a simple ascending notes as fallback
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
              const fallbackAudio = {
                ctx,
                play: () => {
                  try {
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
                    return Promise.resolve()
                  } catch (error) {
                    console.warn("Error playing fallback combo sound:", error)
                    return Promise.resolve()
                  }
                },
                currentTime: 0,
              }

              // Replace the audio element with our fallback
              comboSoundRef.current = fallbackAudio as any
              setAudioLoaded((prev) => ({ ...prev, combo: true }))
            } catch (error) {
              console.warn("Could not create fallback audio:", error)
              setAudioLoaded((prev) => ({ ...prev, combo: true }))
            }
          },
        )
      } catch (error) {
        console.error("Error setting up combo sound:", error)
        setAudioLoaded((prev) => ({ ...prev, combo: true }))
      }

      // Create select sound
      try {
        selectSoundRef.current = createAudio(
          "/sounds/select.mp3",
          () => setAudioLoaded((prev) => ({ ...prev, select: true })),
          (e) => {
            console.warn("Failed to load select sound, using fallback", e)
            try {
              // Create a simple click as fallback
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
              const fallbackAudio = {
                ctx,
                play: () => {
                  try {
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
                    return Promise.resolve()
                  } catch (error) {
                    console.warn("Error playing fallback select sound:", error)
                    return Promise.resolve()
                  }
                },
                currentTime: 0,
                volume: 0.3,
              }

              // Replace the audio element with our fallback
              selectSoundRef.current = fallbackAudio as any
              setAudioLoaded((prev) => ({ ...prev, select: true }))
            } catch (error) {
              console.warn("Could not create fallback audio:", error)
              setAudioLoaded((prev) => ({ ...prev, select: true }))
            }
          },
        )
      } catch (error) {
        console.error("Error setting up select sound:", error)
        setAudioLoaded((prev) => ({ ...prev, select: true }))
      }

      // Create ambient sound
      try {
        ambientSoundRef.current = createAudio(
          "/sounds/ocean-waves.mp3",
          () => {
            setAudioLoaded((prev) => ({ ...prev, ambient: true }))
            if (ambientEnabled && ambientSoundRef.current && "loop" in ambientSoundRef.current) {
              ambientSoundRef.current.loop = true
              ambientSoundRef.current.volume = 0.2
              safePromise(ambientSoundRef.current.play())
            }
          },
          (e) => {
            console.warn("Failed to load ambient sound, using fallback", e)
            try {
              // Create a simple ambient noise as fallback
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
              let isPlaying = false

              const fallbackAudio = {
                ctx,
                loop: false,
                volume: 0.2,
                play: () => {
                  try {
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
                  } catch (error) {
                    console.warn("Error playing fallback ambient sound:", error)
                    return Promise.resolve()
                  }
                },
                pause: () => {
                  try {
                    if (!isPlaying) return
                    isPlaying = false

                    if (fallbackAudio._source) {
                      fallbackAudio._source.stop()
                      fallbackAudio._source = null
                    }
                  } catch (error) {
                    console.warn("Error pausing fallback ambient sound:", error)
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
                safePromise(fallbackAudio.play())
              }
            } catch (error) {
              console.warn("Could not create fallback audio:", error)
              setAudioLoaded((prev) => ({ ...prev, ambient: true }))
            }
          },
        )
      } catch (error) {
        console.error("Error setting up ambient sound:", error)
        setAudioLoaded((prev) => ({ ...prev, ambient: true }))
      }

      // Configure select sound to be quieter
      if (selectSoundRef.current && "volume" in selectSoundRef.current) {
        selectSoundRef.current.volume = 0.3
      }
    }

    return () => {
      // Clean up audio elements
      if (ambientSoundRef.current) {
        if ("pause" in ambientSoundRef.current) {
          try {
            ambientSoundRef.current.pause()
          } catch (error) {
            console.warn("Error pausing ambient sound during cleanup:", error)
          }
        }
        if ("removeEventListener" in ambientSoundRef.current) {
          try {
            ambientSoundRef.current.removeEventListener("canplaythrough", () => {})
            ambientSoundRef.current.removeEventListener("error", () => {})
          } catch (error) {
            console.warn("Error removing event listeners during cleanup:", error)
          }
        }
      }

      // Clean up other audio elements
      const cleanupAudio = (ref: React.MutableRefObject<any>) => {
        if (ref.current && "removeEventListener" in ref.current) {
          try {
            ref.current.removeEventListener("canplaythrough", () => {})
            ref.current.removeEventListener("error", () => {})
          } catch (error) {
            console.warn("Error removing event listeners during cleanup:", error)
          }
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
          try {
            safePromise(ambientSoundRef.current.play())
          } catch (error) {
            console.warn("Error playing ambient sound:", error)
          }
        }
      } else {
        if ("pause" in ambientSoundRef.current) {
          try {
            ambientSoundRef.current.pause()
          } catch (error) {
            console.warn("Error pausing ambient sound:", error)
          }
        }
      }
    }
  }, [audioEnabled, ambientEnabled, audioLoaded.ambient])

  // Play sounds based on game state
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.success) return

    if (successfulSubmission && successSoundRef.current && "play" in successSoundRef.current) {
      try {
        if ("currentTime" in successSoundRef.current) {
          successSoundRef.current.currentTime = 0
        }
        safePromise(successSoundRef.current.play())
      } catch (error) {
        console.warn("Error playing success sound:", error)
      }
    }
  }, [successfulSubmission, audioEnabled, audioLoaded.success])

  useEffect(() => {
    if (!audioEnabled || !audioLoaded.error) return

    if (invalidSubmission && errorSoundRef.current && "play" in errorSoundRef.current) {
      try {
        if ("currentTime" in errorSoundRef.current) {
          errorSoundRef.current.currentTime = 0
        }
        safePromise(errorSoundRef.current.play())
      } catch (error) {
        console.warn("Error playing error sound:", error)
      }
    }
  }, [invalidSubmission, audioEnabled, audioLoaded.error])

  // Track completedObjectives.length to detect when new objectives are completed
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.objective || !objectiveSoundRef.current || !("play" in objectiveSoundRef.current))
      return

    // Check if any new objectives were completed
    const newCompletedObjectives = completedObjectives.filter((id) => !prevCompletedObjectives.current.includes(id))

    if (newCompletedObjectives.length > 0) {
      try {
        if ("currentTime" in objectiveSoundRef.current) {
          objectiveSoundRef.current.currentTime = 0
        }
        safePromise(objectiveSoundRef.current.play())

        // Update the ref to the current completed objectives
        prevCompletedObjectives.current = [...completedObjectives]
      } catch (error) {
        console.warn("Error playing objective sound:", error)
      }
    }
  }, [completedObjectives, audioEnabled, audioLoaded.objective])

  // Play a sound when an island is selected
  useEffect(() => {
    if (!audioEnabled || !audioLoaded.select || !selectSoundRef.current || !("play" in selectSoundRef.current)) return

    // Only play sound when a new island is selected (length increases)
    if (selectedIslands.length > prevSelectedLength.current) {
      try {
        if ("currentTime" in selectSoundRef.current) {
          selectSoundRef.current.currentTime = 0
        }
        safePromise(selectSoundRef.current.play())
      } catch (error) {
        console.warn("Error playing select sound:", error)
      }
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
    checkAudioFiles()
  }, [])

  return null // This component doesn't render anything
}
