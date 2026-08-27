import type { ReactNode } from 'react'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default:
    'bg-neutral-100 text-neutral-700',
  success:
    'bg-emerald-50 text-emerald-700',
  warning:
    'bg-amber-50 text-amber-700',
  danger:
    'bg-red-50 text-red-700',
  info:
    'bg-blue-50 text-blue-700',
}

export default function Badge({
  children,
  variant = 'default',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variants[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
