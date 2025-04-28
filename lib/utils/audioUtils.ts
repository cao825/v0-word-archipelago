/**
 * Utility functions for audio handling
 */

/**
 * Preloads audio files and returns which ones are available
 */
export const preloadAudioFiles = async (): Promise<Record<string, boolean>> => {
  const audioFiles = ["success.mp3", "error.mp3", "objective.mp3", "combo.mp3", "select.mp3", "ocean-waves.mp3"]

  const results: Record<string, boolean> = {}

  await Promise.all(
    audioFiles.map(async (file) => {
      try {
        const response = await fetch(`/sounds/${file}`, { method: "HEAD" })
        results[file] = response.ok
      } catch (error) {
        console.warn(`Failed to preload ${file}:`, error)
        results[file] = false
      }
    }),
  )

  return results
}

/**
 * Creates a simple beep sound using Web Audio API
 * @param frequency - The frequency of the beep in Hz
 * @param duration - The duration of the beep in seconds
 * @param volume - The volume of the beep (0-1)
 */
export const createBeepSound = (frequency = 440, duration = 0.3, volume = 0.2): (() => Promise<void>) => {
  return () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return Promise.resolve()

      const ctx = new AudioContext()
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

      return new Promise((resolve) => {
        setTimeout(resolve, duration * 1000)
      })
    } catch (error) {
      console.warn("Error creating beep sound:", error)
      return Promise.resolve()
    }
  }
}
