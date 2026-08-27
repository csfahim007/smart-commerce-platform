import type { HTMLAttributes } from 'react'

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export default function Card({
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-neutral-200 bg-white shadow-sm',
        paddingClasses[padding],
        className,
      ].join(' ')}
      {...props}
    />
  )
}
