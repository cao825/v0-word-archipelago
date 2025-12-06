"use client"

import { useEffect, useRef, useEffectEvent } from "react"
import { useAppDispatch } from "./hooks"
import { tickTimer } from "../slices/gameSlice"

export function useGameTimer(gameActive: boolean) {
  const dispatch = useAppDispatch()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const onTick = useEffectEvent(() => {
    dispatch(tickTimer())
  })

  useEffect(() => {
    if (gameActive) {
      timerRef.current = setInterval(() => {
        onTick()
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameActive])
}
