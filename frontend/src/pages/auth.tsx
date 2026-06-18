import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  useEffect(() => {
    if (isAuthenticated) window.location.href = '/'
  }, [isAuthenticated])

  const startLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/discord/login`
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-container p-8 text-center">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">TBD</span> Reforger
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Sign in to register, deploy, and manage operations.
        </p>
        <button
          type="button"
          onClick={startLogin}
          className="mt-6 w-full rounded-lg bg-primary py-3 font-medium text-on-primary"
        >
          Sign in with Discord
        </button>
        <Link to="/" className="mt-4 block text-sm text-on-surface-variant hover:text-primary">
          Continue browsing without signing in
        </Link>
      </div>
    </div>
  )
}

export function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-xl border border-border-subtle bg-surface-container p-8 text-center">
        <h1 className="text-xl font-semibold">Auth Callback</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          OAuth callback is scaffolded. Backend redirect pending (TRACKING T-002).
        </p>
        <Link to="/login" className="mt-4 inline-block text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  )
}
