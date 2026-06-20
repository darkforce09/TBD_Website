// Right-panel default (Ultra Plan §5.2): a catalog of placeable assets. Clicking a
// card drops that unit at the map center and selects it. (The registry-backed
// drag-and-drop-onto-canvas version lands with the Asset Registry in a later phase;
// click-to-place is the functional stand-in now that the Toolbelt no longer places.)

import { Crosshair, Radio, Shield, Stethoscope, User, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  addSlot,
  getTerrain,
  useMapStore,
  type MissionDoc,
  type TacticalMapApi,
} from '@/features/tactical-map'

interface Asset {
  role: string
  tag?: string
  icon: LucideIcon
}

const INFANTRY: Asset[] = [
  { role: 'Squad Leader', tag: 'SL', icon: Shield },
  { role: 'Rifleman', icon: User },
  { role: 'Medic', tag: 'MED', icon: Stethoscope },
  { role: 'Engineer', tag: 'ENG', icon: Wrench },
  { role: 'Machine Gunner', tag: 'MG', icon: Crosshair },
  { role: 'Radio Operator', tag: 'RTO', icon: Radio },
]

const TERRAIN = getTerrain('everon')

export function AssetBrowser({
  md,
  flyTo,
}: {
  md: MissionDoc
  flyTo: TacticalMapApi['flyTo'] | undefined
}) {
  const setSelection = useMapStore((s) => s.setSelection)

  const place = (asset: Asset) => {
    const jitter = () => (Math.random() - 0.5) * 400
    const pos = { x: TERRAIN.width / 2 + jitter(), y: TERRAIN.height / 2 + jitter() }
    const id = addSlot(md, pos, { role: asset.role, tag: asset.tag })
    setSelection({ kind: 'slot', id })
    flyTo?.(pos)
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h2 className="text-headline-sm text-on-surface">Asset Browser</h2>
        <p className="text-label-sm normal-case text-outline">
          Click an asset to place it on the map.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <span className="text-label-sm uppercase tracking-wider text-outline">Infantry</span>
        <div className="grid grid-cols-2 gap-2">
          {INFANTRY.map((a) => (
            <button
              key={a.role}
              type="button"
              onClick={() => place(a)}
              className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-high/30 px-2.5 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
            >
              <a.icon className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 truncate text-label-md text-on-surface-variant">
                {a.role}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 opacity-50">
        <span className="text-label-sm uppercase tracking-wider text-outline">
          Vehicles & Objects
        </span>
        <p className="rounded-lg border border-dashed border-outline-variant/30 px-3 py-4 text-center text-label-sm normal-case text-outline">
          Registry-backed assets arrive in a later phase.
        </p>
      </section>
    </div>
  )
}
