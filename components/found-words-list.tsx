import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FoundWordsListProps {
  foundWords: string[]
}

export default function FoundWordsList({ foundWords }: FoundWordsListProps) {
  return (
    <Card className="border-sky-700 bg-sky-800/80 shadow-lg">
      <CardHeader className="pb-1 pt-2">
        <CardTitle className="text-base text-white font-light tracking-wide">FOUND WORDS</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {foundWords.length === 0 ? (
          <p className="text-sky-300 text-center py-2 text-xs">No words found yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto pr-1">
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
      </CardContent>
    </Card>
  )
}
