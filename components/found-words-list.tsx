interface FoundWordsListProps {
  foundWords: string[]
}

export default function FoundWordsList({ foundWords }: FoundWordsListProps) {
  return (
    <div>
      {foundWords.length === 0 ? (
        <p className="text-sky-300 text-center py-2 text-sm italic">No words found yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {foundWords.map((word, index) => (
            <span
              key={index}
              className="bg-sky-700/60 text-white px-2 py-1 rounded-md text-sm border border-sky-600/50"
            >
              {word.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
