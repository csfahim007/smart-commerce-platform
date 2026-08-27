export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-square animate-pulse bg-neutral-200" />

      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />

        <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-200" />

        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />

        <div className="h-3 w-28 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}