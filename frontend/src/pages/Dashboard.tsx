import { Link } from 'react-router-dom'
import { MaterialIcon } from '@/components/MaterialIcon'
import { useAuthStore } from '@/store/useAuthStore'

const announcements = [
  {
    date: 'Oct 24',
    title: 'Server Hardware Upgrade',
    body: 'Migration to a high-tickrate dedicated environment completed successfully.',
  },
  {
    date: 'Oct 22',
    title: 'Modpack Update - v2.1.0',
    body: 'Integrated new RHS weapon systems and updated ACE medical parameters.',
  },
  {
    date: 'Oct 20',
    title: 'Tactical SOP Revision',
    body: 'Updated communication protocols for platoon-level operations.',
  },
]

export function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border border-border-subtle bg-surface-container p-8 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="z-10 flex flex-col items-center gap-2">
          <span className="rounded-full border border-border-subtle bg-surface-container-high px-3 py-1 text-xs font-semibold tracking-widest text-secondary uppercase">
            Everon
          </span>
          <div className="my-6 scale-[2.5] font-semibold tracking-widest text-primary">
            T-MINUS 04:12:00
          </div>
          <p className="text-on-surface-variant">Operation Enduring Freedom — Tuesday 20:00 EST</p>
        </div>
        {isAuthenticated ? (
          <button type="button" className="z-10 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-on-primary">
            Register for Deployment
          </button>
        ) : (
          <Link
            to="/login"
            className="z-10 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-on-primary"
          >
            Sign in to Register
          </Link>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border-subtle bg-surface-container p-6">
          <div className="flex items-center gap-3">
            <MaterialIcon name="dns" className="text-success" />
            <h3 className="font-semibold">Online</h3>
          </div>
          <span className="text-xs font-semibold text-success uppercase">Status: Active</span>
          <p className="text-on-surface-variant">45/64 Players (Arland)</p>
        </div>
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border-subtle bg-surface-container p-6">
          <div className="flex items-center gap-3">
            <MaterialIcon name="package_2" className="text-primary" />
            <h3 className="font-semibold">Core Modpack v2.1</h3>
          </div>
          <span className="text-xs font-semibold text-primary uppercase">Synced</span>
          <p className="text-on-surface-variant">45.2 GB Total</p>
        </div>
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border-subtle bg-surface-container p-6">
          <div className="flex items-center gap-3">
            <MaterialIcon name="shield" className="text-secondary" />
            <h3 className="font-semibold">Deployed</h3>
          </div>
          <span className="text-xs font-semibold text-secondary uppercase">Assignment</span>
          <p className="text-on-surface-variant">US Army — Alpha 1-1 — Medic</p>
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-4">
        <h2 className="border-b border-border-subtle pb-2 text-lg font-semibold">Recent Announcements</h2>
        {announcements.map((a) => (
          <div
            key={a.title}
            className="flex cursor-pointer flex-col gap-4 rounded-xl border border-border-subtle bg-surface-container p-5 transition-colors hover:bg-surface-container-high sm:flex-row sm:items-center"
          >
            <div className="shrink-0 rounded-full border border-border-subtle bg-surface-container-highest px-3 py-1">
              <span className="text-xs font-semibold text-secondary uppercase">{a.date}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">{a.title}</h4>
              <p className="text-sm text-on-surface-variant">{a.body}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
