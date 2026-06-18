import { MaterialIcon } from '@/components/MaterialIcon'
import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

export function EventManagerPage() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Event Manager"
        subtitle="Schedule upcoming deployments and toggle registration locks."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <OpsCard className="bg-surface-container-high">
          <h2 className="mb-4 text-lg font-semibold">October 2024</h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="py-1 font-semibold text-on-surface-variant">
                {d}
              </span>
            ))}
            {days.map((d) => (
              <button
                key={d}
                type="button"
                className={cn(
                  'rounded py-2 hover:bg-surface-container',
                  d === 28 && 'bg-primary text-on-primary',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </OpsCard>
        <OpsCard className="bg-surface-container-high">
          <h2 className="mb-4 text-lg font-semibold">Schedule Operation</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Date</label>
              <p className="text-sm font-medium">Tuesday, October 28</p>
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Start Time</label>
              <input type="text" defaultValue="20:00 EST" className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Mission</label>
              <select className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
                <option>Select from Mission Library...</option>
                <option>Operation Red Dawn</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Registration</label>
              <select className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
                <option>Open</option>
                <option>Locked</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-on-primary">
                Publish Event
              </button>
              <button type="button" className="rounded-lg border border-error/50 px-4 py-2 text-sm text-error">
                Delete
              </button>
            </div>
          </div>
        </OpsCard>
      </div>
    </div>
  )
}

export function MissionApprovalsPage() {
  const rows = [
    { mission: 'Operation Sandstorm', author: 'PlayerOne', map: 'Arland', submitted: 'Oct 24, 14:00' },
    { mission: 'Defend Morton', author: 'DeltaActual', map: 'Everon', submitted: 'Oct 23, 09:30' },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Mission Approvals"
        subtitle="Review and authorize community-submitted missions for the live database."
      />
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high text-xs font-semibold uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 text-left">Mission</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Map</th>
              <th className="px-4 py-3 text-left">Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-container">
            {rows.map((r) => (
              <tr key={r.mission}>
                <td className="px-4 py-3 font-medium">{r.mission}</td>
                <td className="px-4 py-3">{r.author}</td>
                <td className="px-4 py-3">{r.map}</td>
                <td className="px-4 py-3 text-on-surface-variant">{r.submitted}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-2 text-primary hover:underline">
                    Review
                  </button>
                  <button type="button" className="mr-2 text-success hover:underline">
                    Approve
                  </button>
                  <button type="button" className="text-error hover:underline">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-on-surface-variant">Showing 2 of 24 pending</p>
    </div>
  )
}

export function PersonnelRosterPage() {
  const users = [
    { discord: 'Dave#1234', arma: '[TBD] Admin Dave', role: 'Platform Admin', warnings: 0 },
    { discord: 'RandomGuy#9999', arma: 'Unlinked', role: 'Enlisted', warnings: 1 },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Personnel Roster" subtitle="Manage and audit registered platform users." />
      <input
        type="search"
        placeholder="Search Discord ID or Arma Name..."
        className="mb-6 w-full max-w-md rounded-lg border border-border-subtle bg-surface-container px-3 py-2 text-sm"
      />
      <div className="overflow-hidden rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high text-xs font-semibold uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 text-left">Discord</th>
              <th className="px-4 py-3 text-left">Arma Identity</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Warnings</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface-container">
            {users.map((u) => (
              <tr key={u.discord}>
                <td className="px-4 py-3">{u.discord}</td>
                <td className="px-4 py-3">{u.arma}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.warnings}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-2 text-primary hover:underline">
                    Edit
                  </button>
                  <button type="button" className="text-error hover:underline">
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ContentManagerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Content Manager"
        subtitle="Create and distribute operational updates across the network."
      />
      <div className="mb-6 flex gap-2">
        <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm text-on-primary">
          Publish News Announcement
        </button>
        <button type="button" className="rounded-lg bg-surface-container-high px-4 py-2 text-sm text-on-surface-variant">
          Edit SOP Wiki Page
        </button>
      </div>
      <OpsCard className="bg-surface-container-high">
        <input
          type="text"
          defaultValue="Operation Thunderstrike Briefing"
          placeholder="Post Title"
          className="mb-4 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm font-medium"
        />
        <select className="mb-4 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm">
          <option>Modpack Update</option>
          <option>Community Event</option>
        </select>
        <div className="mb-2 flex gap-1 border-b border-border-subtle pb-2">
          {['bold', 'format_list_bulleted', 'link', 'image'].map((icon) => (
            <button key={icon} type="button" className="rounded p-1.5 hover:bg-surface-container">
              <MaterialIcon name={icon} className="text-sm" />
            </button>
          ))}
        </div>
        <textarea
          rows={8}
          placeholder="Draft your briefing here..."
          className="mb-4 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm"
        />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked className="rounded" />
          Push to Discord Webhook
        </label>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg border border-border-subtle px-4 py-2 text-sm">
            Save Draft
          </button>
          <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary">
            Publish Content
          </button>
        </div>
      </OpsCard>
    </div>
  )
}

const auditLines = [
  { level: 'INFO', text: "Admin Dave approved mission 'Operation Sandstorm'.", color: 'text-success' },
  { level: 'WARN', text: 'Active server FPS dropped below 20 for 15 seconds.', color: 'text-warning' },
  { level: 'CRIT', text: 'Webhook failed to push payload to Discord channel #announcements.', color: 'text-error' },
]

export function AuditLogsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">System Audit Logs</h1>
          <p className="text-on-surface-variant">Real-time terminal view of all system events.</p>
        </div>
        <button type="button" className="rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-surface-container-high">
          Export CSV
        </button>
      </div>
      <input
        type="search"
        placeholder="Filter by admin, event, or keyword..."
        className="mb-4 w-full rounded-lg border border-border-subtle bg-surface-container px-3 py-2 font-mono text-sm"
      />
      <div className="rounded-xl border border-border-subtle bg-[#0a0e18] p-4 font-mono text-sm">
        <div className="mb-3 flex items-center gap-2 text-xs text-success">
          <span className="pulse-dot h-2 w-2 rounded-full bg-success" />
          LIVE
        </div>
        {auditLines.map((line) => (
          <p key={line.text} className="mb-2">
            <span className={cn('font-semibold', line.color)}>[{line.level}]</span>{' '}
            <span className="text-on-surface-variant">{line.text}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
