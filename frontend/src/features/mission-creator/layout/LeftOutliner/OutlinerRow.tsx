// One Outliner row — compact label + optional tag chip + active left-bar (mirrors
// the ListDetailItem active idiom), with a hover-revealed remove control.

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface OutlinerRowProps {
  label: string
  tag?: string
  active?: boolean
  onClick: () => void
  onRemove?: () => void
}

export function OutlinerRow({ label, tag, active, onClick, onRemove }: OutlinerRowProps) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-1.5 rounded-md pl-2.5 pr-1 py-1.5 text-left transition-colors',
        active
          ? 'bg-surface-variant/80 text-on-surface'
          : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-on-surface',
      )}
    >
      {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />}
      <button type="button" onClick={onClick} className="min-w-0 flex-1 truncate text-label-md">
        {label}
      </button>
      {tag && (
        <Badge variant="primary" className="shrink-0">
          {tag}
        </Badge>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="shrink-0 rounded p-0.5 text-outline opacity-0 transition-opacity hover:text-error-alert group-hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
