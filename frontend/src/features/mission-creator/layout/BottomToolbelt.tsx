// Bottom Toolbelt (Ultra Plan §5.3): tool buttons bound to the store's activeTool +
// a live X/Y/Z cursor read-out in JetBrains Mono. Phase 3 wires Select + Place Unit;
// Ruler / Line-of-Sight / Place Objective are visible placeholders (their tools land
// in Phase 8). Floating HudBar-style bar over the map.

import { Eye, MousePointer2, Ruler } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMapStore, type ToolId } from '@/features/tactical-map'
import { cn } from '@/lib/utils'
import { overlayPanel } from './overlay'

interface Tool {
  id: ToolId
  label: string
  icon: LucideIcon
  enabled: boolean
}

// Select is wired; Ruler / Line-of-Sight land in Phase 8. Unit placement is via the
// Asset Browser, not the Toolbelt (Ultra Plan §5.3).
const TOOLS: Tool[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, enabled: true },
  { id: 'ruler', label: 'Ruler', icon: Ruler, enabled: false },
  { id: 'los', label: 'Line of Sight', icon: Eye, enabled: false },
]

export function BottomToolbelt({
  cursorWorld,
}: {
  cursorWorld: { x: number; y: number } | null
}) {
  const activeTool = useMapStore((s) => s.activeTool)
  const setActiveTool = useMapStore((s) => s.setActiveTool)

  const fmt = (n: number) => Math.round(n).toString().padStart(5, ' ')

  return (
    <div className={cn(overlayPanel, 'flex items-center gap-1 px-1.5 py-1.5')}>
      {TOOLS.map((t) => {
        const active = activeTool === t.id
        return (
          <button
            key={t.id}
            type="button"
            disabled={!t.enabled}
            onClick={() => setActiveTool(t.id)}
            title={t.enabled ? t.label : `${t.label} (soon)`}
            aria-label={t.label}
            aria-pressed={active}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-label-md transition-colors',
              active
                ? 'bg-primary/20 text-primary'
                : 'text-on-surface-variant hover:bg-white/10',
              !t.enabled && 'opacity-30 hover:bg-transparent',
            )}
          >
            <t.icon className="size-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        )
      })}

      <span className="mx-1 h-5 w-px bg-white/10" />

      <div className="flex items-center gap-2 px-1 font-mono text-code-md text-on-surface-variant">
        <span>
          X<span className="ml-1 text-on-surface">{cursorWorld ? fmt(cursorWorld.x) : '   —'}</span>
        </span>
        <span>
          Y<span className="ml-1 text-on-surface">{cursorWorld ? fmt(cursorWorld.y) : '   —'}</span>
        </span>
        <span className="text-outline">
          Z<span className="ml-1">—</span>
        </span>
      </div>
    </div>
  )
}
