import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { MaterialIcon } from '@/components/MaterialIcon'
import { OpsCard } from '@/components/OpsCard'
import { cn } from '@/lib/utils'

const STATIC = {
  serverName: import.meta.env.VITE_DEFAULT_SERVER_NAME ?? 'TBD Main',
  uptime: '02:14:33',
  players: { current: 55, max: 64 },
  fps: 44,
  mission: 'Operation Enduring Freedom',
  sector: 'Sector A-4',
  ingameTime: '14:30 Local',
  weather: 'Overcast / Light Rain',
  ip: '192.168.1.100',
  port: '2001',
  modpack: 'Core v2.1',
  terrainImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAUXZRXghD0qO-MzHFQlZMvCAI0Xu9Ux_D0gnmTxZKsJEYHH0287WHUXJ4rVM_eTcVRVQr5JV1VDB7NjF-myS7U3B_1HD-3J7c-jotLbPFW7KPvBcYUCY0s5j5wW6_Y2wFxanpj3KU7BBYAAc3eonGjwl2KlwzK1YCdmGwydoOg1PnBXO4JMg3dMakoLs7gk1FjQZROdeExjo9icJ6S-ml-3cYZiTCPbzIYlSORTnEvmyf1pH7_mDoTC9PgThkScPpLbjrTNsbKPXw',
}

function IntelField({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-border-subtle bg-surface-container p-4', className)}>
      <span className="mb-1 block text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
        {label}
      </span>
      {children}
    </div>
  )
}

export function ServerIntelPage() {
  const playerPct = Math.round((STATIC.players.current / STATIC.players.max) * 100)
  const connectAddress = `${STATIC.ip} : ${STATIC.port}`

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${STATIC.ip}:${STATIC.port}`)
      toast.success('Server address copied')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[var(--spacing-container-max)]">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-on-surface">Server Intel</h1>
        <p className="text-on-surface-variant">
          Real-time server health and deployment telemetry for{' '}
          <span className="font-medium text-on-surface">{STATIC.serverName}</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OpsCard className="h-full border-primary/30 bg-surface-container-high">
          <header className="mb-4 flex items-center justify-between border-b border-border-subtle pb-4">
            <h2 className="text-lg font-semibold">Server Status</h2>
            <div className="flex items-center gap-2">
              <div className="pulse-dot h-2.5 w-2.5 rounded-full bg-success" />
              <span className="text-xs font-semibold tracking-widest text-success uppercase">Online</span>
            </div>
          </header>
          <div className="flex flex-col gap-4">
            <IntelField label="Uptime">
              <span className="font-mono text-sm tracking-widest text-primary">{STATIC.uptime}</span>
            </IntelField>
            <IntelField label="Player Count">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {STATIC.players.current} / {STATIC.players.max}
                </span>
                <span className="text-sm text-on-surface-variant">Personnel</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${playerPct}%` }}
                />
              </div>
            </IntelField>
            <IntelField label="Server Performance" className="mt-auto">
              <div className="flex items-center gap-2">
                <MaterialIcon name="speed" className="text-lg text-success" />
                <span className="text-success">{STATIC.fps} Server FPS (Healthy)</span>
              </div>
            </IntelField>
          </div>
        </OpsCard>

        <OpsCard className="h-full border-primary/30 bg-surface-container-high">
          <header className="mb-4 border-b border-border-subtle pb-4">
            <h2 className="text-lg font-semibold">Active Deployment</h2>
          </header>
          <div className="relative mb-4 h-32 overflow-hidden rounded-lg border border-border-subtle">
            <img
              src={STATIC.terrainImage}
              alt="Everon terrain"
              className="h-full w-full object-cover object-center grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
            <span className="absolute bottom-3 left-3 rounded border border-border-subtle bg-surface-container-highest/80 px-2 py-1 text-xs font-semibold tracking-widest backdrop-blur-sm">
              {STATIC.sector}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              { icon: 'map', label: 'Mission', value: STATIC.mission },
              { icon: 'schedule', label: 'In-Game Time', value: STATIC.ingameTime },
              { icon: 'cloud', label: 'Weather Conditions', value: STATIC.weather },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-container p-3"
              >
                <MaterialIcon name={row.icon} className="mt-0.5 text-primary" />
                <div>
                  <span className="block text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
                    {row.label}
                  </span>
                  <span className="text-on-surface">{row.value}</span>
                </div>
              </li>
            ))}
          </ul>
        </OpsCard>

        <OpsCard className="h-full border-primary/30 bg-surface-container-high">
          <header className="mb-4 border-b border-border-subtle pb-4">
            <h2 className="text-lg font-semibold">Connection Gateway</h2>
          </header>
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-1 flex-col justify-center">
              <div className="relative mb-4 rounded-lg border border-border-subtle bg-background p-4">
                <span className="mb-2 block text-xs font-semibold tracking-widest text-on-surface-variant uppercase">
                  IP / Port
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm tracking-widest text-primary">{connectAddress}</span>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="rounded p-1 text-on-surface-variant transition-colors hover:text-primary"
                    title="Copy to clipboard"
                  >
                    <MaterialIcon name="content_copy" className="text-sm" />
                  </button>
                </div>
              </div>
              <IntelField label="Required Modpack">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="extension" className="text-lg text-primary" />
                  <span>{STATIC.modpack}</span>
                  <span className="ml-auto rounded border border-green-700/50 bg-success-muted px-2 py-0.5 text-xs font-semibold tracking-widest text-on-surface">
                    Verified
                  </span>
                </div>
              </IntelField>
            </div>
            <button
              type="button"
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-on-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors hover:bg-primary/90"
              onClick={() => toast.message('Launch requires the Reforger client')}
            >
              <MaterialIcon name="play_arrow" className="text-lg" />
              Launch Reforger &amp; Connect
            </button>
          </div>
        </OpsCard>
      </div>
    </div>
  )
}
