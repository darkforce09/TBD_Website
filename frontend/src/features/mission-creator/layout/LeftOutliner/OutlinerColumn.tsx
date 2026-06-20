// One Miller column: a titled, scrollable list of OutlinerRows with an add button.
// FactionColumn / SquadColumn / SlotColumn are all this same component with
// different data (the §1.1 trio collapsed into one reusable piece).

import { Plus } from 'lucide-react'
import { OutlinerRow } from './OutlinerRow'

export interface ColumnItem {
  id: string
  label: string
  tag?: string
}

interface OutlinerColumnProps {
  title: string
  items: ColumnItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd?: () => void
  onRemove?: (id: string) => void
  emptyHint?: string
}

export function OutlinerColumn({
  title,
  items,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  emptyHint,
}: OutlinerColumnProps) {
  return (
    <div className="flex w-44 min-w-0 flex-col border-r border-outline-variant/20 last:border-r-0">
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="text-label-sm uppercase tracking-wider text-outline">{title}</span>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${title}`}
            className="rounded p-0.5 text-on-surface-variant transition-colors hover:bg-primary/15 hover:text-primary"
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 pb-2">
        {items.length === 0 ? (
          <p className="px-2 py-1 text-label-sm normal-case text-outline">
            {emptyHint ?? '—'}
          </p>
        ) : (
          items.map((it) => (
            <OutlinerRow
              key={it.id}
              label={it.label}
              tag={it.tag}
              active={it.id === activeId}
              onClick={() => onSelect(it.id)}
              onRemove={onRemove ? () => onRemove(it.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
