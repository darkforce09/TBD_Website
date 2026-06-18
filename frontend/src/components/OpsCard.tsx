import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface OpsCardProps {
  children: ReactNode
  className?: string
  glow?: boolean
}

/** Tactical panel card — matches Stitch surface-container styling. */
export function OpsCard({ children, className, glow }: OpsCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border-subtle bg-surface-container p-6',
        glow && 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
