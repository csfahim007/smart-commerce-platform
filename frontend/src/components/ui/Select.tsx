import type {
  SelectHTMLAttributes,
} from 'react'

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{
    value: string | number
    label: string
  }>
}

export default function Select({
  label,
  error,
  options,
  id,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-800"
        >
          {label}
        </label>
      )}

      <select
        id={id}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition',
          'focus:border-neutral-500 focus:ring-2 focus:ring-neutral-950/10',
          error
            ? 'border-red-300'
            : 'border-neutral-200',
          className,
        ].join(' ')}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
