import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { useAuthStore } from '@/store/useAuthStore'
import type { DashboardResponse } from '@/types/api'

export function useDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/dashboard')
      return data
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useLeaderboards(category: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['leaderboards', category],
    queryFn: async () => {
      const { data } = await api.get('/leaderboards', { params: { category } })
      return data
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useServers() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const { data } = await api.get('/servers')
      return data
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  })
}

export function useAnnouncements() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await api.get('/announcements')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useEvents() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useMissions() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data } = await api.get('/missions')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useModpacks() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['modpacks'],
    queryFn: async () => {
      const { data } = await api.get('/modpacks')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useApprovals() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data } = await api.get('/approvals')
      return data
    },
    enabled: isAuthenticated && useAuthStore.getState().hasMinRole('admin'),
  })
}

export function usePersonnel() {
  return useQuery({
    queryKey: ['personnel'],
    queryFn: async () => ({ data: [] }),
    enabled: false,
  })
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => ({ data: [] }),
    enabled: false,
  })
}
