import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <AlertCircle
        size={28}
        className="text-red-600"
      />

      <h2 className="mt-4 text-lg font-semibold text-red-900">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm text-red-700">
        {description}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  )
}