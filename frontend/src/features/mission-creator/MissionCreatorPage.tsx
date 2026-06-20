// Full-bleed route shell for the 2D Mission Creator. Phase 1 mounts only the live
// tactical map; the Top Command Strip, Left Outliner, Right Inspector and Bottom
// Toolbelt (Ultra Plan §5) arrive in Phase 3. The route carries the `fullBleed`
// handle so AppLayout runs this page full-height with no padding.

import { useParams } from 'react-router-dom'
import { TacticalMap } from '@/features/tactical-map'
import { FpsCounter } from './FpsCounter'

export default function MissionCreatorPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <TacticalMap terrain="everon" />

      <FpsCounter />

      {/* Minimal non-functional marker so the route is self-evidently the editor.
          Replaced by the Top Command Strip in Phase 3. */}
      <div className="glass pointer-events-none absolute left-4 top-4 z-10 rounded-md px-3 py-1.5 font-mono text-code-md text-on-surface-variant">
        Mission Creator · {id ?? '—'}
      </div>
    </div>
  )
}
