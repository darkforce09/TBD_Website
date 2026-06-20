// Top Command Strip (Ultra Plan §5.4): inline mission title, a "Visual-Git" cluster
// (Undo/Redo now; the full timeline scrubber is Phase 9), and a disabled Export
// button (the compiler is Phase 9). Frosted glass bar floating over the map.

import { useEffect, useReducer, useState } from 'react'
import { Download, Redo2, Settings2, Undo2 } from 'lucide-react'
import {
  setTitle,
  useMapStore,
  type MissionDoc,
  type UndoController,
} from '@/features/tactical-map'
import { cn } from '@/lib/utils'
import { overlayPanel } from './overlay'
import { MissionSettingsDialog } from './MissionSettingsDialog'

interface TopCommandStripProps {
  md: MissionDoc
  undo: UndoController
}

export function TopCommandStrip({ md, undo }: TopCommandStripProps) {
  const title = useMapStore((s) => s.meta?.title ?? '')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [, bump] = useReducer((n: number) => n + 1, 0)
  // Re-render on undo-stack changes so Undo/Redo reflect canUndo/canRedo.
  useEffect(() => undo.subscribe(bump), [undo])

  const iconBtn =
    'rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <div className={cn(overlayPanel, 'flex h-11 items-center gap-2 px-3')}>
      <input
        value={title}
        onChange={(e) => setTitle(md, e.target.value)}
        placeholder="Untitled Mission"
        aria-label="Mission title"
        className="min-w-0 flex-1 bg-transparent text-label-md font-semibold text-on-surface outline-none placeholder:text-outline"
      />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={iconBtn}
          onClick={undo.undo}
          disabled={!undo.canUndo()}
          aria-label="Undo"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          type="button"
          className={iconBtn}
          onClick={undo.redo}
          disabled={!undo.canRedo()}
          aria-label="Redo"
        >
          <Redo2 className="size-4" />
        </button>
      </div>

      <button
        type="button"
        className={iconBtn}
        onClick={() => setSettingsOpen(true)}
        aria-label="Mission settings"
        title="Mission settings"
      >
        <Settings2 className="size-4" />
      </button>

      <span className="h-5 w-px bg-white/10" />

      <button
        type="button"
        disabled
        title="The mission compiler lands in a later phase"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md bg-action/20 px-2.5 py-1 text-label-md text-on-surface-variant',
          'opacity-50',
        )}
      >
        <Download className="size-4" />
        Export
      </button>

      <MissionSettingsDialog md={md} open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
