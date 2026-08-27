import {
  GitBranch,
  Heart,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-bold tracking-tight text-neutral-950"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-[10px] text-white">
                AI
              </span>

              AI Commerce
            </Link>

            <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
              A production-oriented AI e-commerce platform
              built with React, Laravel, Redis, and AI-powered
              product discovery.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500">
            <Link
              to="/products"
              className="transition hover:text-neutral-950"
            >
              Products
            </Link>

            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 transition hover:text-neutral-950"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Assistant
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-neutral-950"
            >
              <GitBranch className="h-3.5 w-3.5" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-100 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} AI Commerce. All rights
            reserved.
          </span>

          <span className="inline-flex items-center gap-1">
            Built with <Heart className="h-3 w-3" /> for production
            learning.
          </span>
        </div>
      </div>
    </footer>
  )
}
