import type {
  InputHTMLAttributes,
  ReactNode,
} from 'react'

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: ReactNode
}

export default function Input({
  label,
  error,
  hint,
  leftElement,
  id,
  className = '',
  ...props
}: InputProps) {
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

      <div className="relative">
        {leftElement && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            {leftElement}
          </div>
        )}

        <input
          id={id}
          className={[
            'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition',
            'placeholder:text-neutral-400',
            'focus:border-neutral-500 focus:ring-2 focus:ring-neutral-950/10',
            'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-neutral-200',
            leftElement ? 'pl-10' : '',
            className,
          ].join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${id}-error`
              : hint
                ? `${id}-hint`
                : undefined
          }
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${id}-hint`}
          className="text-xs text-neutral-500"
        >
          {hint}
        </p>
      )}
    </div>
  )
}
