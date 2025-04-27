"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { GameTheme, GameDuration } from "@/lib/slices/gameSlice"

interface GameSettingsProps {
  currentTheme: GameTheme
  currentDuration: GameDuration
  onSetTheme: (theme: GameTheme) => void
  onSetDuration: (duration: GameDuration) => void
  onClose: () => void
}

export default function GameSettings({
  currentTheme,
  currentDuration,
  onSetTheme,
  onSetDuration,
  onClose,
}: GameSettingsProps) {
  return (
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg">
      <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-white">Game Settings</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-sky-100 hover:bg-sky-700/50">
          <X size={18} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-sky-100 mb-3">Game Duration</h3>
          <RadioGroup
            defaultValue={currentDuration.toString()}
            onValueChange={(value) => onSetDuration(Number.parseInt(value) as GameDuration)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="120" id="duration-120" />
              <Label htmlFor="duration-120" className="text-white">
                2 Minutes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="300" id="duration-300" />
              <Label htmlFor="duration-300" className="text-white">
                5 Minutes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="600" id="duration-600" />
              <Label htmlFor="duration-600" className="text-white">
                10 Minutes
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-sm font-medium text-sky-100 mb-3">Visual Theme</h3>
          <RadioGroup
            defaultValue={currentTheme}
            onValueChange={(value) => onSetTheme(value as GameTheme)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tropical" id="theme-tropical" />
              <Label htmlFor="theme-tropical" className="text-white">
                Tropical
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sunset" id="theme-sunset" />
              <Label htmlFor="theme-sunset" className="text-white">
                Sunset
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="stormy" id="theme-stormy" />
              <Label htmlFor="theme-stormy" className="text-white">
                Stormy
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}
