"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface IslandFeedbackProps {
  isActive: boolean
  position: { x: number; y: number }
}

export function IslandFeedback({ isActive, position }: IslandFeedbackProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  if (!visible) return null

  return (
    <div
      className={cn(
        "absolute pointer-events-none z-10 flex items-center justify-center",
        "text-xs text-white bg-red-500/80 rounded-md px-2 py-1",
        "transform transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y - 30}px`,
      }}
    >
      No moves here
    </div>
  )
}
