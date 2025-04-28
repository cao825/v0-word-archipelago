"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import type { GameTheme } from "@/lib/slices/gameSlice"

interface MobileSettingsSheetProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: GameTheme
  onSetTheme: (theme: GameTheme) => void
}

export default function MobileSettingsSheet({ isOpen, onClose, currentTheme, onSetTheme }: MobileSettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [ambientEnabled, setAmbientEnabled] = useState(false)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Sync with audio settings when opened
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.gameAudio) {
      setAudioEnabled(window.gameAudio.isAudioEnabled())
      setAmbientEnabled(window.gameAudio.isAmbientEnabled())
    }
  }, [isOpen])

  const toggleAudio = (enabled: boolean) => {
    setAudioEnabled(enabled)
    if (typeof window !== "undefined" && window.gameAudio) {
      window.gameAudio.toggleAudio(enabled)

      // If audio is disabled, also disable ambient
      if (!enabled) {
        setAmbientEnabled(false)
        window.gameAudio.toggleAmbient(false)
      }
    }
  }

  const toggleAmbient = (enabled: boolean) => {
    setAmbientEnabled(enabled)
    if (typeof window !== "undefined" && window.gameAudio) {
      window.gameAudio.toggleAmbient(enabled)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-sky-800 rounded-t-xl z-50 shadow-xl"
          >
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-700 text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Visual Theme */}
                <div>
                  <h3 className="text-sm font-medium text-sky-100 mb-3">Visual Theme</h3>
                  <RadioGroup
                    defaultValue={currentTheme}
                    onValueChange={(value) => onSetTheme(value as GameTheme)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 bg-sky-700/50 p-3 rounded-lg">
                      <RadioGroupItem value="tropical" id="mobile-theme-tropical" />
                      <Label htmlFor="mobile-theme-tropical" className="text-white">
                        Tropical
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sky-700/50 p-3 rounded-lg">
                      <RadioGroupItem value="sunset" id="mobile-theme-sunset" />
                      <Label htmlFor="mobile-theme-sunset" className="text-white">
                        Sunset
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sky-700/50 p-3 rounded-lg">
                      <RadioGroupItem value="stormy" id="mobile-theme-stormy" />
                      <Label htmlFor="mobile-theme-stormy" className="text-white">
                        Stormy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sky-700/50 p-3 rounded-lg">
                      <RadioGroupItem value="volcanic" id="mobile-theme-volcanic" />
                      <Label htmlFor="mobile-theme-volcanic" className="text-white">
                        Volcanic
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Audio Settings */}
                <div>
                  <h3 className="text-sm font-medium text-sky-100 mb-3">Audio Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-sky-700/50 p-3 rounded-lg">
                      <Label htmlFor="audio-toggle" className="text-white">
                        Enable Sound Effects
                      </Label>
                      <Switch id="audio-toggle" checked={audioEnabled} onCheckedChange={toggleAudio} />
                    </div>
                    <div className="flex items-center justify-between bg-sky-700/50 p-3 rounded-lg">
                      <Label htmlFor="ambient-toggle" className="text-white">
                        Ocean Ambient Sound
                      </Label>
                      <Switch
                        id="ambient-toggle"
                        checked={ambientEnabled}
                        onCheckedChange={toggleAmbient}
                        disabled={!audioEnabled}
                      />
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="bg-sky-700/50 p-3 rounded-lg">
                  <h3 className="text-sm font-medium text-sky-100 mb-2">How to Play</h3>
                  <ul className="text-xs text-sky-200 space-y-1 list-disc pl-4">
                    <li>Tap islands to select letters and form words</li>
                    <li>Double-tap the last island to quickly submit a word</li>
                    <li>Complete objectives to earn bonus points</li>
                    <li>Build a combo by finding words quickly</li>
                  </ul>
                </div>
              </div>

              <div className="h-safe-area-bottom mt-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
