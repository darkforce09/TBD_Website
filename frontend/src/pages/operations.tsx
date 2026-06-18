import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

export function AnnouncementsPage() {
  const pinned = {
    title: 'Mandatory Core Modpack Sync (v2.1)',
    meta: 'Posted by Admin Dave • Oct 24',
    body: 'All personnel must sync the Core Modern Expansion modpack before the next deployment window.',
    badges: ['PINNED', 'MODPACK UPDATE'],
  }
  const posts = [
    { title: 'Weekend PvP: Cold War Escalation', meta: 'Posted by Sgt. Miller • Oct 22', badge: 'COMMUNITY EVENT' },
    { title: 'Server Maintenance Window', meta: 'Posted by Admin Dave • Oct 20', badge: 'OPERATIONS' },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Command Announcements" subtitle="Operational updates from command staff." />
      <OpsCard className="mb-6 border-primary/30 bg-surface-container-high">
        <div className="mb-4 flex flex-wrap gap-2">
          {pinned.badges.map((b) => (
            <span key={b} className="rounded bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
              {b}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-semibold">{pinned.title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{pinned.meta}</p>
        <p className="mt-4 text-on-surface-variant">{pinned.body}</p>
        <button type="button" className="mt-4 text-sm font-medium text-primary hover:underline">
          Read Full Briefing
        </button>
      </OpsCard>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <OpsCard key={post.title} className="bg-surface-container-high">
            <span className="mb-2 inline-block rounded bg-surface-container-highest px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
              {post.badge}
            </span>
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">{post.meta}</p>
          </OpsCard>
        ))}
      </div>
    </div>
  )
}

export function DeploymentsPage() {
  const upcoming = {
    title: 'Operation Enduring Freedom',
    when: 'Tuesday, Oct 28 • 20:00 EST',
    slot: 'US Army - Alpha 1-1 (Combat Medic)',
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="My Deployments"
        subtitle="Service record and upcoming operations."
      />
      <OpsCard className="mb-8 bg-surface-container-high">
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <span className="text-on-surface-variant">Total Operations</span>
            <p className="text-2xl font-bold text-primary">42</p>
          </div>
          <div>
            <span className="text-on-surface-variant">Attendance Rate</span>
            <p className="text-2xl font-bold text-success">94%</p>
          </div>
        </div>
      </OpsCard>
      <h2 className="mb-4 text-lg font-semibold">Awaiting Deployment</h2>
      <OpsCard className="mb-8 border-primary/20 bg-surface-container-high">
        <h3 className="text-lg font-semibold">{upcoming.title}</h3>
        <p className="mt-1 text-on-surface-variant">{upcoming.when}</p>
        <p className="mt-3 text-sm">
          <span className="text-on-surface-variant">ASSIGNED SLOT: </span>
          {upcoming.slot}
        </p>
      </OpsCard>
      <h2 className="mb-4 text-lg font-semibold">Service Record</h2>
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
            <tr>
              <th className="px-4 py-3">Operation</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-container">
            <tr>
              <td className="px-4 py-3">Operation Red Storm</td>
              <td className="px-4 py-3 text-on-surface-variant">Oct 14</td>
              <td className="px-4 py-3 text-success">MISSION SUCCESS</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Operation Overcast</td>
              <td className="px-4 py-3 text-on-surface-variant">Oct 07</td>
              <td className="px-4 py-3 text-warning">PARTIAL</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const leaderboardTabs = ['K/D Ratio', 'Command Win Rate', 'Wall of Shame']

export function LeaderboardsPage() {
  const podium = [
    { rank: 2, name: 'Bravo_Six', stat: '3.20 K/D' },
    { rank: 1, name: 'Ghost_Reaper', stat: '4.2 K/D' },
    { rank: 3, name: 'DeltaActual', stat: '2.95 K/D' },
  ]
  const rows = [
    { rank: 4, name: 'PlayerOne', kills: 892, kd: '2.71' },
    { rank: 5, name: 'SgtMiller', kills: 845, kd: '2.55' },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Global Leaderboards"
        subtitle="Real-time tactical performance metrics across all active theaters."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {leaderboardTabs.map((tab, i) => (
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
      <div className="mb-8 grid grid-cols-3 items-end gap-4">
        {podium.map((p) => (
          <OpsCard
            key={p.name}
            className={cn(
              'text-center bg-surface-container-high',
              p.rank === 1 && 'border-primary/40 py-8',
            )}
          >
            <span className="text-3xl font-bold text-primary">#{p.rank}</span>
            <p className="mt-2 font-semibold">{p.name}</p>
            <p className="text-sm text-on-surface-variant">{p.stat}</p>
          </OpsCard>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high text-xs font-semibold uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Operator</th>
              <th className="px-4 py-3">Kills</th>
              <th className="px-4 py-3">K/D</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-container">
            {rows.map((r) => (
              <tr key={r.name}>
                <td className="px-4 py-3 text-on-surface-variant">{r.rank}</td>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.kills}</td>
                <td className="px-4 py-3 text-primary">{r.kd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="mt-4 text-sm font-medium text-primary hover:underline">
        Load More Intel
      </button>
    </div>
  )
}

export function EventSchedulePage() {
  const events = [
    { name: 'Operation Enduring Freedom', when: 'Oct 28, 20:00 EST', map: 'Everon', status: 'OPEN', fill: '40/60' },
    { name: 'Operation Red Storm', when: 'Nov 02, 19:00 EST', map: 'Arland', status: 'FULL', fill: '64/64' },
    { name: 'Operation Overcast', when: 'Live Now', map: 'Everon', status: 'LIVE', fill: '—' },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Upcoming Operations"
        subtitle="Review and register for scheduled tactical deployments."
      />
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-sm text-on-primary">
          List
        </button>
        <button type="button" className="rounded-lg bg-surface-container-high px-3 py-1.5 text-sm text-on-surface-variant">
          Calendar
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high text-xs font-semibold uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 text-left">Operation</th>
              <th className="px-4 py-3 text-left">Schedule</th>
              <th className="px-4 py-3 text-left">Terrain</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-container">
            {events.map((e) => (
              <tr key={e.name}>
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{e.when}</td>
                <td className="px-4 py-3">{e.map}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'rounded px-2 py-0.5 text-xs font-semibold',
                      e.status === 'OPEN' && 'bg-success-muted text-success',
                      e.status === 'FULL' && 'bg-surface-container-highest text-on-surface-variant',
                      e.status === 'LIVE' && 'bg-primary/20 text-primary',
                    )}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-on-surface-variant">{e.fill}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-on-surface-variant">Showing 3 of 12 upcoming operations</p>
    </div>
  )
}
