"use client"

import { useState } from "react"
import { ArrowDownAZ, ArrowDown01 } from "lucide-react"

interface FoundWordsListProps {
  foundWords: string[]
}

export default function FoundWordsList({ foundWords }: FoundWordsListProps) {
  const [sortBy, setSortBy] = useState<"recent" | "length" | "alphabetical">("recent")

  // Sort the words based on the selected sort method
  const sortedWords = [...foundWords].sort((a, b) => {
    if (sortBy === "length") {
      return b.length - a.length // Sort by length (longest first)
    } else if (sortBy === "alphabetical") {
      return a.localeCompare(b) // Sort alphabetically
    }
    return 0 // Default: keep original order (most recent first)
  })

  return (
    <div>
      {foundWords.length === 0 ? (
        <p className="text-sky-300 text-center py-2 text-sm italic">No words found yet</p>
      ) : (
        <>
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={() => setSortBy("recent")}
              className={`text-xs px-2 py-1 rounded ${sortBy === "recent" ? "bg-sky-700 text-white" : "bg-sky-800/40 text-sky-300"}`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy("length")}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${sortBy === "length" ? "bg-sky-700 text-white" : "bg-sky-800/40 text-sky-300"}`}
            >
              <ArrowDown01 size={12} />
              Length
            </button>
            <button
              onClick={() => setSortBy("alphabetical")}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${sortBy === "alphabetical" ? "bg-sky-700 text-white" : "bg-sky-800/40 text-sky-300"}`}
            >
              <ArrowDownAZ size={12} />
              A-Z
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedWords.map((word, index) => (
              <span
                key={index}
                className="bg-sky-700/60 text-white px-2 py-1 rounded-md text-sm border border-sky-600/50"
              >
                {word.toUpperCase()}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
