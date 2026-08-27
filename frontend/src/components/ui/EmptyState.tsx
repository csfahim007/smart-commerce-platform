import { PackageSearch } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
}

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-neutral-100 p-4">
        <PackageSearch
          size={28}
          className="text-neutral-500"
        />
      </div>

      <h2 className="text-lg font-semibold text-neutral-900">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm text-neutral-500">
        {description}
      </p>
    </div>
  )
}
