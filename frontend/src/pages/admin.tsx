import { useState } from 'react'
import { toast } from 'sonner'
import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'
import { AdminGate } from '@/components/AdminGate'
import { QueryState } from '@/components/QueryState'
import { MaterialIcon } from '@/components/MaterialIcon'
import { SplitPane, SplitPaneEmpty } from '@/components/ui/split-pane'
import { ListDetailItem } from '@/components/ui/list-detail-item'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { HudBar } from '@/components/ui/glass-panel'
import {
  useApprovals,
  useAuditLogs,
  useEvents,
  useMissions,
  usePersonnel,
} from '@/hooks/queries'
import {
  useAddEventMission,
  useApproveMission,
  useBanUser,
  useCreateEvent,
  useDeleteEvent,
  usePublishAnnouncement,
  useRejectMission,
  useUpdateUserRole,
} from '@/hooks/mutations'
import { formatLocalDateTime, formatShortDate, terrainLabel } from '@/lib/format'
import type { AuditLog, RosterRow } from '@/types/api'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  { value: 'enlisted', label: 'Enlisted' },
  { value: 'leader', label: 'Leader' },
  { value: 'mission_maker', label: 'Mission Maker' },
  { value: 'admin', label: 'Admin' },
]

const inputClass =
  'w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-label-md outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 disabled:opacity-50'

export function EventManagerPage() {
  const { data: eventsData } = useEvents('all')
  const { data: missionsData } = useMissions('global')
  const createEvent = useCreateEvent()
  const deleteEvent = useDeleteEvent()

  const [createOpen, setCreateOpen] = useState(false)
  const [attachFor, setAttachFor] = useState<string | null>(null)

  const [startTime, setStartTime] = useState('')
  const [maxSlots, setMaxSlots] = useState(64)
  const [nameOverride, setNameOverride] = useState('')
  const [briefing, setBriefing] = useState('')
  const [open, setOpen] = useState(true) // registration open

  const [missionId, setMissionId] = useState('')
  const [missionStart, setMissionStart] = useState('')
  const addMission = useAddEventMission(attachFor ?? '')

  const missions = missionsData?.data ?? []
  const events = eventsData?.data ?? []

  const handleCreate = () => {
    if (!startTime) {
      toast.error('Start time is required')
      return
    }
    createEvent.mutate(
      {
        start_time: new Date(startTime).toISOString(),
        max_slots: maxSlots,
        name_override: nameOverride || undefined,
        briefing: briefing || undefined,
        registration_locked: !open,
      },
      {
        onSuccess: () => {
          toast.success('Operation created — attach missions to generate ORBATs')
          setCreateOpen(false)
          setStartTime('')
          setNameOverride('')
          setBriefing('')
        },
        onError: () => toast.error('Failed to create operation'),
      },
    )
  }

  const handleAttach = () => {
    if (!missionId || !missionStart) {
      toast.error('Mission and start time are required')
      return
    }
    addMission.mutate(
      { mission_id: missionId, start_time: new Date(missionStart).toISOString() },
      {
        onSuccess: () => {
          toast.success('Mission attached — ORBAT generated from mission.json')
          setMissionId('')
          setMissionStart('')
          setAttachFor(null)
        },
        onError: () => toast.error('Failed to attach mission'),
      },
    )
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this operation? This cannot be undone.')) return
    deleteEvent.mutate(id, {
      onSuccess: () => toast.success('Operation deleted'),
      onError: () => toast.error('Failed to delete operation'),
    })
  }

  return (
    <AdminGate>
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader
            title="Event Manager"
            subtitle="Create campaign operations, then attach missions — ORBATs generate automatically."
          />
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md font-medium text-on-primary"
          >
            <MaterialIcon name="add" className="text-[20px]" />
            New Operation
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-label-md text-on-surface-variant">No operations scheduled.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map((e) => (
              <OpsCard key={e.id} glass className="flex-row items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-headline-sm text-on-surface">
                    {e.name_override || 'Untitled Operation'}
                  </h3>
                  <p className="mt-1 text-label-md text-on-surface-variant">
                    {formatLocalDateTime(e.start_time)} · {e.mission_count} mission
                    {e.mission_count === 1 ? '' : 's'} · {e.filled}/{e.total_slots} slots
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={e.registration_locked ? 'neutral' : 'success'}>
                    {e.registration_locked ? 'Locked' : 'Open'}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setAttachFor(e.id)}
                    className="rounded-lg border border-primary/40 px-3 py-1.5 text-label-md text-primary hover:bg-primary/10"
                  >
                    Attach Mission
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    className="rounded-lg p-1.5 text-error-alert hover:bg-error-alert/10"
                    aria-label="Delete operation"
                  >
                    <MaterialIcon name="delete" />
                  </button>
                </div>
              </OpsCard>
            ))}
          </div>
        )}
      </div>

      {/* Create operation — frosted modal over the list */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent title="New Operation">
          <div className="space-y-4">
            <Field label="Start Time">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Name">
              <input
                type="text"
                value={nameOverride}
                onChange={(e) => setNameOverride(e.target.value)}
                placeholder="e.g. Twin Theaters"
                className={inputClass}
              />
            </Field>
            <Field label="Briefing">
              <textarea
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Overarching operation lore / briefing"
                rows={3}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 items-end gap-3">
              <Field label="Max Slots">
                <input
                  type="number"
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2.5">
                <span className="text-label-md text-on-surface-variant">Registration open</span>
                <Switch checked={open} onCheckedChange={setOpen} />
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose className="rounded-lg px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-variant/50">
              Cancel
            </DialogClose>
            <button
              type="button"
              onClick={handleCreate}
              disabled={createEvent.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
            >
              Create Operation
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attach mission — frosted modal */}
      <Dialog open={attachFor != null} onOpenChange={(o) => !o && setAttachFor(null)}>
        <DialogContent
          title="Attach Mission"
          description="ORBAT squads/slots are parsed from the mission.json payload."
        >
          <div className="space-y-4">
            <Field label="Mission">
              <select
                value={missionId}
                onChange={(e) => setMissionId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select from Mission Library...</option>
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({terrainLabel(m.terrain)})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mission Start Time">
              <input
                type="datetime-local"
                value={missionStart}
                onChange={(e) => setMissionStart(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose className="rounded-lg px-4 py-2 text-label-md text-on-surface-variant hover:bg-surface-variant/50">
              Cancel
            </DialogClose>
            <button
              type="button"
              onClick={handleAttach}
              disabled={addMission.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
            >
              Attach Mission
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGate>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-label-md text-on-surface-variant">{label}</label>
      {children}
    </div>
  )
}

export function MissionApprovalsPage() {
  const { data, isLoading, isError, error } = useApprovals()
  const approve = useApproveMission()
  const reject = useRejectMission()
  const rows = data?.data ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = rows.find((r) => r.mission_id === selectedId) ?? rows[0] ?? null

  return (
    <AdminGate>
      <QueryState isLoading={isLoading} isError={isError} error={error as Error}>
        <SplitPane
          masterHeader={
            <h2 className="text-headline-sm tracking-wide text-on-surface uppercase">
              Pending Queue
              <span className="ml-2 font-mono text-code-md text-outline">{rows.length}</span>
            </h2>
          }
          master={
            rows.length === 0 ? (
              <p className="px-1 py-4 text-label-md text-on-surface-variant">No pending approvals.</p>
            ) : (
              rows.map((r) => (
                <ListDetailItem
                  key={r.mission_id}
                  active={selected?.mission_id === r.mission_id}
                  onClick={() => setSelectedId(r.mission_id)}
                  meta={`[${formatShortDate(r.submitted_at)}]`}
                  title={r.title}
                  preview={`By ${r.author_name} · ${terrainLabel(r.terrain)}`}
                />
              ))
            )
          }
          detail={
            selected ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-outline-variant/20 bg-surface-container-low/40 px-8 py-7 backdrop-blur-md">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{terrainLabel(selected.terrain)}</Badge>
                    <Badge variant="neutral">{selected.author_name}</Badge>
                    <span className="ml-auto font-mono text-code-md text-outline">
                      {formatLocalDateTime(selected.submitted_at)}
                    </span>
                  </div>
                  <h1 className="text-headline-lg text-on-surface">{selected.title}</h1>
                </div>
                <div className="flex-1 px-8 py-8">
                  <p className="text-body-md text-on-surface-variant">
                    Review the submitted mission for {terrainLabel(selected.terrain)} authored by{' '}
                    {selected.author_name}. Approving publishes it to the live mission database;
                    rejecting returns it to the author.
                  </p>
                </div>
                <HudBar className="static mx-8 mb-8 translate-x-0 self-start">
                  <button
                    type="button"
                    disabled={reject.isPending}
                    onClick={() =>
                      reject.mutate(
                        { id: selected.mission_id },
                        {
                          onSuccess: () => toast.success('Mission rejected'),
                          onError: () => toast.error('Rejection failed'),
                        },
                      )
                    }
                    className="rounded-lg border border-error-alert/50 px-4 py-2 text-label-md text-error-alert hover:bg-error-alert/10 disabled:opacity-50"
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    disabled={approve.isPending}
                    onClick={() =>
                      approve.mutate(selected.mission_id, {
                        onSuccess: () => toast.success('Mission approved'),
                        onError: () => toast.error('Approval failed'),
                      })
                    }
                    className="rounded-lg bg-primary px-5 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
                  >
                    Approve &amp; Publish
                  </button>
                </HudBar>
              </div>
            ) : (
              <SplitPaneEmpty
                icon={<MaterialIcon name="task_alt" className="text-4xl" />}
                message="Queue clear — no pending approvals."
              />
            )
          }
        />
      </QueryState>
    </AdminGate>
  )
}

export function PersonnelRosterPage() {
  const [q, setQ] = useState('')
  const { data, isLoading, isError, error } = usePersonnel(q || undefined)
  const updateRole = useUpdateUserRole()
  const banUser = useBanUser()
  const users = data?.data ?? []
  const [selected, setSelected] = useState<RosterRow | null>(null)

  return (
    <AdminGate>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Personnel Roster" subtitle="Manage and audit registered platform users." />
        <input
          type="search"
          placeholder="Search Discord ID or Arma Name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-6 w-full max-w-md rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-label-md"
        />
        <QueryState isLoading={isLoading} isError={isError} error={error as Error}>
          {users.length === 0 ? (
            <p className="text-on-surface-variant">No users found.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-outline-variant/30">
              <table className="w-full text-label-md">
                <thead className="bg-surface-container-high text-label-sm text-on-surface-variant uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Discord</th>
                    <th className="px-4 py-3 text-left">Arma Identity</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-right">Warnings</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container">
                  {users.map((u) => (
                    <tr
                      key={u.discord_id}
                      onClick={() => setSelected(u)}
                      className={cn(
                        'cursor-pointer transition-colors hover:bg-primary/5',
                        selected?.discord_id === u.discord_id && 'bg-primary/10',
                      )}
                    >
                      <td className="px-4 py-3">{u.discord_handle || u.username}</td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {u.arma_character || u.arma_id || 'Unlinked'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-label-sm text-on-surface-variant uppercase">{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{u.warnings}</td>
                      <td className="px-4 py-3 text-right">
                        {u.is_banned ? (
                          <Badge variant="error">Banned</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryState>
      </div>

      {/* Slide-over operative dossier */}
      <Sheet open={selected != null} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <SheetContent
            title={selected.discord_handle || selected.username}
            description={selected.arma_character || selected.arma_id || 'Unlinked Arma identity'}
            footer={
              !selected.is_banned ? (
                <button
                  type="button"
                  className="w-full rounded-lg border border-error-alert/50 py-2 text-label-md text-error-alert hover:bg-error-alert/10"
                  onClick={() => {
                    const reason = window.prompt('Ban reason (optional):')
                    if (reason === null) return
                    banUser.mutate(
                      { discordId: selected.discord_id, reason: reason || undefined },
                      {
                        onSuccess: () => {
                          toast.success('User banned')
                          setSelected(null)
                        },
                        onError: () => toast.error('Ban failed'),
                      },
                    )
                  }}
                >
                  Ban Operative
                </button>
              ) : (
                <Badge variant="error">Banned</Badge>
              )
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Warnings" value={String(selected.warnings)} />
                <Stat label="Status" value={selected.is_banned ? 'Banned' : 'Active'} />
              </div>
              <div>
                <label className="mb-1 block text-label-sm text-on-surface-variant uppercase">Role</label>
                <select
                  value={selected.role}
                  onChange={(e) => {
                    const role = e.target.value
                    updateRole.mutate(
                      { discordId: selected.discord_id, role },
                      {
                        onSuccess: () => {
                          toast.success('Role updated')
                          setSelected({ ...selected, role })
                        },
                        onError: () => toast.error('Failed to update role'),
                      },
                    )
                  }}
                  className={inputClass}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </AdminGate>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-variant/30 p-3">
      <span className="text-label-sm text-on-surface-variant uppercase">{label}</span>
      <p className="mt-1 font-mono text-headline-sm text-on-surface">{value}</p>
    </div>
  )
}

export function ContentManagerPage() {
  const publish = usePublishAnnouncement()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState('update')
  const [pinned, setPinned] = useState(false)
  const [pushDiscord, setPushDiscord] = useState(true)

  const handlePublish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required')
      return
    }
    publish.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        tag,
        is_pinned: pinned,
        push_to_discord: pushDiscord,
        status: 'published',
      },
      {
        onSuccess: () => {
          toast.success('Announcement published')
          setTitle('')
          setBody('')
        },
        onError: () => toast.error('Publish failed'),
      },
    )
  }

  return (
    <AdminGate>
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          title="Content Manager"
          subtitle="Create and distribute operational updates across the network."
        />
        <OpsCard glass>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title"
            className="mb-4 w-full border-none bg-transparent text-headline-md text-on-surface outline-none placeholder:text-outline"
          />
          <select value={tag} onChange={(e) => setTag(e.target.value)} className={cn(inputClass, 'mb-4')}>
            <option value="update">Update</option>
            <option value="event">Community Event</option>
            <option value="modpack_update">Modpack Update</option>
            <option value="important">Important</option>
          </select>
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Draft your briefing here..."
            className="mb-4 w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-body-md outline-none focus:border-primary/60"
          />
          <div className="mb-5 flex flex-col gap-3 border-t border-outline-variant/30 pt-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-label-md text-on-surface-variant">Pin announcement</span>
              <Switch checked={pinned} onCheckedChange={setPinned} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-label-md text-on-surface-variant">Push to Discord webhook</span>
              <Switch checked={pushDiscord} onCheckedChange={setPushDiscord} />
            </label>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publish.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
          >
            {publish.isPending ? 'Publishing…' : 'Publish Content'}
          </button>
        </OpsCard>
      </div>
    </AdminGate>
  )
}

function severityVariant(s: string): 'primary' | 'tertiary' | 'warning' | 'error' {
  switch (s.toLowerCase()) {
    case 'warn':
    case 'warning':
      return 'warning'
    case 'crit':
    case 'critical':
    case 'error':
      return 'error'
    case 'info':
      return 'tertiary'
    default:
      return 'primary'
  }
}

function severityText(s: string) {
  switch (s.toLowerCase()) {
    case 'warn':
    case 'warning':
      return 'text-tactical-yellow'
    case 'crit':
    case 'critical':
    case 'error':
      return 'text-error-alert'
    case 'info':
      return 'text-tertiary'
    default:
      return 'text-success'
  }
}

export function AuditLogsPage() {
  const [q, setQ] = useState('')
  const { data, isLoading, isError, error } = useAuditLogs({ q: q || undefined })
  const lines = data?.data ?? []
  const [selected, setSelected] = useState<AuditLog | null>(null)
  const active = selected ?? lines[0] ?? null

  return (
    <AdminGate>
      <QueryState isLoading={isLoading} isError={isError} error={error as Error}>
        <SplitPane
          masterWidth="60%"
          masterHeader={
            <input
              type="search"
              placeholder="Filter by admin, action, or keyword..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-1.5 font-mono text-code-md outline-none focus:border-primary/60"
            />
          }
          master={
            <div className="font-mono text-code-md">
              {lines.length === 0 ? (
                <p className="px-1 py-4 text-on-surface-variant">No audit logs.</p>
              ) : (
                lines.map((line) => (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => setSelected(line)}
                    className={cn(
                      'flex w-full gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-surface-variant/40',
                      active?.id === line.id && 'bg-surface-variant/60',
                      line.severity.toLowerCase().startsWith('crit') &&
                        'border-l-2 border-error-alert',
                    )}
                  >
                    <span className="shrink-0 text-outline">
                      {formatShortDate(line.created_at)}
                    </span>
                    <span className={cn('shrink-0 font-semibold', severityText(line.severity))}>
                      [{line.severity.toUpperCase()}]
                    </span>
                    <span className="truncate text-on-surface-variant">
                      {line.actor_name ? `${line.actor_name}: ` : ''}
                      {line.message}
                    </span>
                  </button>
                ))
              )}
              <span className="ml-2 inline-block h-3 w-2 animate-pulse bg-primary align-middle" />
            </div>
          }
          detail={
            active ? (
              <div className="px-8 py-7">
                <div className="mb-4 flex items-center gap-2">
                  <Badge variant={severityVariant(active.severity)}>{active.severity}</Badge>
                  <span className="ml-auto font-mono text-code-md text-outline">
                    {formatLocalDateTime(active.created_at)}
                  </span>
                </div>
                <h1 className="font-mono text-headline-sm text-on-surface">{active.action}</h1>
                <p className="mt-3 text-body-md text-on-surface-variant">{active.message}</p>
                <dl className="mt-6 space-y-2 border-t border-outline-variant/30 pt-4 font-mono text-code-md">
                  <Row label="ID" value={String(active.id)} />
                  <Row label="Actor" value={active.actor_name || active.actor_id || '—'} />
                  <Row label="Action" value={active.action} />
                  <Row label="Severity" value={active.severity} />
                </dl>
              </div>
            ) : (
              <SplitPaneEmpty
                icon={<MaterialIcon name="terminal" className="text-4xl" />}
                message="Select a log entry to inspect."
              />
            )
          }
        />
      </QueryState>
    </AdminGate>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-outline uppercase">{label}</dt>
      <dd className="text-on-surface-variant">{value}</dd>
    </div>
  )
}
