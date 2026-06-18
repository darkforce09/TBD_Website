import { Link } from 'react-router-dom'
import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

const missions = [
  { id: '1', title: 'Operation Enduring Freedom', author: 'Admin Dave', map: 'Everon', players: 64, tags: ['COOP'] },
  { id: '2', title: 'Urban Vanguard', author: 'Sgt. Miller', map: 'Arland', players: 48, tags: ['PvP'] },
  { id: '3', title: 'Silent Watch', author: 'Cmdr. Mitchell', map: 'Everon', players: 32, tags: ['Zeus'] },
]

export function MissionLibraryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Mission Library" subtitle="Browse, filter, and deploy active operations." />
      <div className="mb-6 flex flex-wrap gap-2">
        {['Global', 'My Missions', 'Bookmarked'].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium',
              i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <OpsCard className="mb-6 flex flex-wrap gap-3 bg-surface-container-high">
        <input
          type="search"
          placeholder="Search operations..."
          className="min-w-[200px] flex-1 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm"
        />
        <select className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
          <option>All Terrains</option>
          <option>Everon</option>
          <option>Arland</option>
        </select>
        <select className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
          <option>All Modes</option>
        </select>
      </OpsCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((m) => (
          <OpsCard key={m.id} className="bg-surface-container-high">
            <div className="mb-2 flex flex-wrap gap-1">
              {m.tags.map((t) => (
                <span key={t} className="rounded bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  {t}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-semibold">{m.title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {m.author} — {m.map} — {m.players} max
            </p>
            <Link to={`/missions/${m.id}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              View Operation Intel
            </Link>
          </OpsCard>
        ))}
      </div>
    </div>
  )
}

export function MissionOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Operation Enduring Freedom"
        subtitle="by Admin Dave — Terrain: Everon — v1.2.0"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <OpsCard className="bg-surface-container-high">
            <h2 className="mb-3 text-lg font-semibold">Mission Briefing</h2>
            <p className="text-on-surface-variant">
              Soviet forces have established a heavily fortified communications relay at Montignac.
              Alpha company will conduct a dawn assault to seize the objective before reinforcements arrive.
            </p>
          </OpsCard>
          <OpsCard className="bg-surface-container-high">
            <h2 className="mb-3 text-lg font-semibold">Topographic Preview</h2>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border-subtle bg-surface text-on-surface-variant">
              Map preview (T-003)
            </div>
          </OpsCard>
          <OpsCard className="bg-surface-container-high">
            <h2 className="mb-3 text-lg font-semibold">The Armory</h2>
            <div className="mb-4 flex gap-2">
              {['US Army', 'USSR'].map((f, i) => (
                <button
                  key={f}
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm',
                    i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {['M16A2 Rifle — x45 Available', 'M249 SAW — x12 Available'].map((item) => (
                <div key={item} className="rounded-lg border border-border-subtle bg-surface-container p-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </OpsCard>
        </div>
        <div className="space-y-6">
          <OpsCard className="bg-surface-container-high">
            <h2 className="mb-3 text-lg font-semibold">Command Actions</h2>
            <div className="flex flex-col gap-2">
              <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary">
                Launch 2D Mission Editor
              </button>
              <button type="button" className="rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-surface-container">
                Open Tactical Planner
              </button>
            </div>
          </OpsCard>
          <OpsCard className="bg-surface-container-high">
            <h2 className="mb-3 text-lg font-semibold">ORBAT Summary</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Alpha 1-1</span>
                <span className="text-on-surface-variant">8/8 Slots</span>
              </li>
              <li className="flex justify-between">
                <span>Alpha 1-2</span>
                <span className="text-on-surface-variant">4/8 Slots</span>
              </li>
            </ul>
          </OpsCard>
        </div>
      </div>
    </div>
  )
}

export function MissionCreatorPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Initialize New Mission"
        subtitle="Define the environment parameters before launching the 2D Editor Canvas."
      />
      <OpsCard className="bg-surface-container-high">
        <label className="mb-2 block text-sm font-medium">Operation Designation</label>
        <input
          type="text"
          placeholder="Enter operation designation..."
          className="mb-6 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm"
        />
        <p className="mb-3 text-sm font-medium">Terrain</p>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {[
            { name: 'Everon', detail: '51 km² • Atlantic' },
            { name: 'Arland', detail: '42 km² • Central Europe' },
          ].map((t, i) => (
            <button
              key={t.name}
              type="button"
              className={cn(
                'rounded-lg border p-4 text-left',
                i === 0 ? 'border-primary bg-primary/10' : 'border-border-subtle bg-surface-container',
              )}
            >
              <span className="font-semibold">{t.name}</span>
              <p className="mt-1 text-sm text-on-surface-variant">{t.detail}</p>
            </button>
          ))}
        </div>
        <label className="mb-2 block text-sm font-medium">Insertion Time: 14:00</label>
        <input type="range" className="mb-4 w-full" defaultValue={50} />
        <select className="mb-6 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
          <option>Clear (Default)</option>
          <option>Overcast</option>
          <option>Light Rain</option>
        </select>
        <button type="button" className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-on-primary">
          Initialize 2D Canvas
        </button>
      </OpsCard>
    </div>
  )
}
