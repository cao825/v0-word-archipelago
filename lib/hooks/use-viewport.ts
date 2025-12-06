"use client"

import { useState, useEffect } from "react"

export function useViewport() {
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
      setViewportHeight(window.innerHeight)
    }

    checkViewport()
    window.addEventListener("resize", checkViewport)

    return () => window.removeEventListener("resize", checkViewport)
  }, [])

  return { isMobile, viewportHeight }
}
