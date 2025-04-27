import { Loader2 } from "lucide-react"

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950 text-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-amber-400 animate-spin" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <span className="font-bold text-amber-400">WORD</span> ARCHIPELAGO
        </h1>
        <p className="text-sky-200 text-sm tracking-wide uppercase">Loading your daily word puzzle...</p>
      </div>
    </div>
  )
}
