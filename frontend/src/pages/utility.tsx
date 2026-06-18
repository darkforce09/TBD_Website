import { Link } from 'react-router-dom'
import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'

export function ServerControlPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Server Control" subtitle="RCON panel for TBD Main — restart, map change, live console." />
      <div className="mb-6 rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm">
        This feature is not yet available. See <code className="text-primary">frontend/docs/TRACKING.md</code>{' '}
        item <strong>T-001</strong>.
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <OpsCard className="bg-surface-container-high">
          <h2 className="mb-4 text-lg font-semibold">TBD Main</h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Status: <span className="text-success">Online</span>
          </p>
          <div className="flex flex-col gap-2">
            <button type="button" disabled className="rounded-lg bg-primary/50 py-2 text-sm text-on-primary">
              Restart Server
            </button>
            <button type="button" disabled className="rounded-lg border border-border-subtle py-2 text-sm opacity-50">
              Change Map
            </button>
            <select disabled className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm opacity-50">
              <option>Select mission...</option>
            </select>
          </div>
        </OpsCard>
        <OpsCard className="bg-surface-container-high">
          <h2 className="mb-4 text-lg font-semibold">RCON Console</h2>
          <pre className="h-48 overflow-auto rounded-lg bg-[#0a0e18] p-3 font-mono text-xs text-on-surface-variant">
            [RCON] Connection pending T-001...
            {'\n'}[INFO] Server ready — Arland
          </pre>
        </OpsCard>
      </div>
      <Link to="/" className="mt-6 inline-block text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl font-bold text-primary">404</span>
      <h1 className="mt-4 text-2xl font-bold">Sector Not Found</h1>
      <p className="mt-2 text-on-surface-variant">The requested route does not exist in this AO.</p>
      <Link to="/" className="mt-6 text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  )
}
