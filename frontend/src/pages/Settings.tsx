import { MaterialIcon } from '@/components/MaterialIcon'
import { OpsCard } from '@/components/OpsCard'
import { PageHeader } from '@/components/PageHeader'
import { useAuthStore } from '@/store/useAuthStore'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Settings" subtitle="Account profile, Arma identity, and service statistics." />

      <OpsCard className="mb-6 bg-surface-container-high">
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url || 'https://via.placeholder.com/64'}
              alt=""
              className="h-16 w-16 rounded-full border border-border-subtle object-cover"
            />
            <div>
              <p className="text-lg font-semibold">{user.username}</p>
              <p className="text-sm text-on-surface-variant">{user.discord_handle ?? 'Discord linked'}</p>
              <span className="mt-2 inline-block rounded bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary uppercase">
                {user.role}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-on-surface-variant">Sign in to view your profile.</p>
        )}
      </OpsCard>

      <OpsCard className="mb-6 bg-surface-container-high">
        <h2 className="mb-4 text-lg font-semibold">Arma Identity</h2>
        <p className="mb-4 text-sm text-on-surface-variant">
          Status:{' '}
          <span className={user?.arma_id ? 'text-success' : 'text-on-surface-variant'}>
            {user?.arma_id ? `Linked (${user.arma_id})` : 'Unlinked'}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary">
            Generate Link Code
          </button>
          <button type="button" className="rounded-lg border border-border-subtle px-4 py-2 text-sm">
            Unlink Arma ID
          </button>
        </div>
      </OpsCard>

      <OpsCard className="bg-surface-container-high">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MaterialIcon name="military_tech" className="text-primary" />
          Service Stats
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-variant">Total Operations</span>
            <p className="text-2xl font-bold text-primary">{user?.total_deployments ?? 42}</p>
          </div>
          <div>
            <span className="text-on-surface-variant">Attendance</span>
            <p className="text-2xl font-bold text-success">{user?.attendance_rate ?? 94}%</p>
          </div>
        </div>
      </OpsCard>
    </div>
  )
}
