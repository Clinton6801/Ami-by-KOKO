'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console with full details
    console.error('=== APP LAYOUT ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error digest:', error.digest)
    console.error('Full error object:', error)
    console.error('======================')
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-5">
      <div className="text-7xl">🦜</div>
      <div>
        <h2 className="text-xl font-extrabold text-stone-800 mb-1">
          Oops! Something went wrong
        </h2>
        <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed">
          {error.message || 'An unexpected error occurred. Check the console for details.'}
        </p>
        {error.digest && (
          <p className="text-xs text-stone-400 mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-amber-200"
        >
          🔄 Try again
        </button>
        <button
          onClick={() => window.location.href = '/home'}
          className="w-full bg-white text-stone-600 font-semibold py-3 rounded-2xl transition ring-1 ring-stone-200 hover:bg-stone-50"
        >
          🏠 Go home
        </button>
      </div>
    </div>
  )
}
