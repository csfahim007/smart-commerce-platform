import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-neutral-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white">
              <ShoppingBag className="h-4 w-4" />
            </span>

            <span>AI E-Commerce</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {description}
            </p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center text-sm text-neutral-500">
          {footer}
        </div>
      </div>
    </main>
  )
}
