import { ArrowLeft, Home, SearchX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
          <SearchX className="h-7 w-7 text-neutral-500" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-500 sm:text-base">
          The page you're looking for doesn't exist or may have
          been moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </section>
  )
}
