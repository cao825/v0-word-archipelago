"use client"

import { useEffect, useRef, useEffectEvent } from "react"
import { useAppDispatch } from "./hooks"
import { checkForNewPuzzle } from "../slices/gameSlice"

export function usePuzzleChecker() {
  const dispatch = useAppDispatch()
  const puzzleCheckRef = useRef<NodeJS.Timeout | null>(null)

  const onCheckPuzzle = useEffectEvent(() => {
    dispatch(checkForNewPuzzle())
  })

  const getCheckInterval = useEffectEvent(() => {
    const now = new Date()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    if (minutes >= 59 && seconds >= 45) return 1000
    if (minutes >= 59) return 5000
    if (minutes >= 58) return 15000
    return 60000
  })

  useEffect(() => {
    onCheckPuzzle()

    const setupChecker = () => {
      onCheckPuzzle()
      const interval = getCheckInterval()
      puzzleCheckRef.current = setTimeout(setupChecker, interval)
    }

    setupChecker()

    return () => {
      if (puzzleCheckRef.current) {
        clearTimeout(puzzleCheckRef.current)
      }
    }
  }, [])
}
