import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-sky-800/80 border border-sky-700 rounded-lg p-6 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          <span className="text-amber-400">404</span> Page Not Found
        </h1>
        <p className="text-sky-200 mb-6">The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.</p>
        <Link
          href="/"
          className="block w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md text-center"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
