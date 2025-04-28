interface FoundWordsListProps {
  foundWords: string[]
}

export default function FoundWordsList({ foundWords }: FoundWordsListProps) {
  return (
    <div>
      {foundWords.length === 0 ? (
        <p className="text-sky-400/70 text-center py-1 text-xs italic">No words found yet</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 overflow-y-auto pr-1">
          {foundWords.map((word, index) => (
            <span
              key={index}
              className="bg-sky-900/80 text-amber-300 px-1.5 py-0.5 rounded-md text-xs border border-sky-700"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
