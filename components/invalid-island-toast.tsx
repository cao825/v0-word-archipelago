"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import type { RootState } from "@/lib/store"

export default function InvalidIslandToast() {
  const [visible, setVisible] = useState(false)
  const invalidIslandSelection = useSelector((state: RootState) => state.game.invalidIslandSelection)

  useEffect(() => {
    if (invalidIslandSelection) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [invalidIslandSelection])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium"
        >
          No available moves here
        </motion.div>
      )}
    </AnimatePresence>
  )
}
