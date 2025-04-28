"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Copy, Link } from "lucide-react"
import html2canvas from "html2canvas"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"

interface ShareResultsProps {
  score: number
  foundWordsCount: number
  completedObjectives: number
  totalObjectives: number
  puzzleDate: string
}

export default function ShareResults({
  score,
  foundWordsCount,
  completedObjectives,
  totalObjectives,
  puzzleDate,
}: ShareResultsProps) {
  const [copied, setCopied] = useState(false)
  const [imageBlob, setImageBlob] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Get the completed objectives directly from the Redux store to ensure accuracy
  const completedObjectivesFromStore = useSelector((state: RootState) => state.game.completedObjectives.length)

  // Use the value from the store instead of the prop
  const actualCompletedObjectives = completedObjectivesFromStore

  // Format date for display with error handling
  const formattedDate = (() => {
    try {
      const date = new Date(puzzleDate)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If invalid, use today's date as fallback
        return new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      // Return today's date as fallback
      return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
  })()

  // Generate share text
  const shareText = `🏝️ Word Archipelago: ${formattedDate}\n\n🏆 Score: ${score}\n📚 Words: ${foundWordsCount}\n🎯 Objectives: ${actualCompletedObjectives}/${totalObjectives}\n\nPlay now at word-archipelago.vercel.app`

  // Generate share image
  useEffect(() => {
    if (cardRef.current) {
      const generateImage = async () => {
        try {
          const canvas = await html2canvas(cardRef.current!, {
            backgroundColor: null,
            scale: 2,
          })
          const blob = canvas.toDataURL("image/png")
          setImageBlob(blob)
        } catch (error) {
          console.error("Error generating image:", error)
        }
      }

      generateImage()
    }
  }, [])

  // Copy results to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Copy game link to clipboard
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("https://word-archipelago.vercel.app")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Shareable card */}
      <div
        ref={cardRef}
        className="bg-gradient-to-b from-sky-900 to-sky-950 p-6 rounded-xl shadow-lg w-full max-w-md border border-sky-700"
      >
        <div className="flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white">
              <span className="font-bold text-amber-400">WORD</span> ARCHIPELAGO
            </h3>
            <p className="text-sky-300">{formattedDate}</p>
          </div>

          <div className="bg-sky-800/50 rounded-lg p-4 w-full mb-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400 mb-1">{score}</div>
              <p className="text-sky-300">Final Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-sky-800/30 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">{foundWordsCount}</div>
              <div className="text-sky-300 text-sm">Words Found</div>
            </div>
            <div className="bg-sky-800/30 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">
                {actualCompletedObjectives}/{totalObjectives}
              </div>
              <div className="text-sky-300 text-sm">Objectives</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy Results"}
        </button>

        <button
          onClick={copyLinkToClipboard}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          <Link size={18} />
          Copy Game Link
        </button>

        {imageBlob && (
          <div className="mt-4">
            <p className="text-sm text-slate-400 mb-2">You can also download and share this image:</p>
            <a
              href={imageBlob}
              download={`word-archipelago-${formattedDate}.png`}
              className="block bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
