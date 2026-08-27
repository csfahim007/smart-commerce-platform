export default function FullPageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-live="polite"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-950" />

        <p className="text-sm font-medium text-neutral-500">
          Loading...
        </p>
      </div>
    </div>
  )
}
