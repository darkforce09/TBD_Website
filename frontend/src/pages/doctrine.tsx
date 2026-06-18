import { MaterialIcon } from '@/components/MaterialIcon'
import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

export function ModpacksPage() {
  const mods = ['RHS: Status Quo', 'Task Force Radio (TFAR)', 'ACE3 Medical Framework']

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Server Modpacks"
        subtitle="Required dependencies for deployment. Arma Reforger handles mod downloads automatically when you connect."
      />
      <OpsCard className="bg-surface-container-high">
        <h2 className="text-xl font-semibold">Core Modern Expansion (v2.1)</h2>
        <p className="mt-2 text-sm text-on-surface-variant">Total Size: 45.2 GB — Mods Included: 32</p>
        <ul className="mt-6 space-y-2">
          {mods.map((m) => (
            <li key={m} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-container px-3 py-2 text-sm">
              <MaterialIcon name="extension" className="text-primary" />
              {m}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-on-primary">
            Launch Game &amp; Auto-Download
          </button>
          <button type="button" className="flex-1 rounded-lg border border-border-subtle py-3 text-sm hover:bg-surface-container">
            View Collection in Reforger Workshop
          </button>
        </div>
      </OpsCard>
    </div>
  )
}

const wikiCategories = ['Vehicle Database', 'IFF Protocols', 'Platoon SOPs', 'Medical Procedures']

const vehicles = [
  { name: 'BTR-70', faction: 'USSR', type: 'Light Armored', armament: 'Heavy MG / Infantry' },
  { name: 'LAV-25', faction: 'USMC', type: 'Medium Armored', armament: '25mm Autocannon' },
]

export function WikiPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <p className="mb-3 text-xs font-semibold tracking-widest text-on-surface-variant uppercase">SOP Categories</p>
        <ul className="space-y-1">
          {wikiCategories.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                className={cn(
                  'w-full rounded-lg px-3 py-2 text-left text-sm',
                  i === 0 ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high',
                )}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="min-w-0 flex-1">
        <PageHeader
          title="Vehicle Database &amp; IFF"
          subtitle="Learn strengths, weaknesses, and identification markers of armored assets."
        />
        <OpsCard className="mb-6 border-warning/30 bg-warning/10">
          <p className="text-sm text-warning">
            <strong>CRITICAL:</strong> Do NOT engage armored contacts unless you have positively identified them per IFF protocol.
          </p>
        </OpsCard>
        <div className="mb-6 overflow-hidden rounded-xl border border-border-subtle">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high text-xs font-semibold uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Faction</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-left">Armament</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface-container">
              {vehicles.map((v) => (
                <tr key={v.name}>
                  <td className="px-4 py-3 font-medium">{v.name}</td>
                  <td className="px-4 py-3">{v.faction}</td>
                  <td className="px-4 py-3">{v.type}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{v.armament}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="text-sm font-medium text-primary hover:underline">
          View Full Gallery
        </button>
      </div>
    </div>
  )
}

export function MortarCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Mortar Calculator" subtitle="FP Alpha → TGT 001 — M252 81mm" />
      <div className="relative h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-border-subtle bg-surface-container-lowest">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/4 left-1/3 h-4 w-4 rounded-full border-2 border-success bg-success/30" title="FP Alpha" />
      <div className="absolute top-1/2 left-2/3 h-4 w-4 rounded-full border-2 border-error bg-error/30" title="TGT 001" />
      <OpsCard className="absolute right-4 bottom-4 w-72 border-primary/30 bg-surface-container-high/95 backdrop-blur">
        <h2 className="text-sm font-semibold text-primary">Firing Solution — M252 81mm</h2>
        <dl className="mt-3 space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Distance</dt>
            <dd>1,240 m</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Azimuth</dt>
            <dd>342.5°</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Elevation</dt>
            <dd className="text-primary">1084 mils</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-on-surface-variant">Drag markers on the map to recalculate.</p>
      </OpsCard>
      </div>
    </div>
  )
}
