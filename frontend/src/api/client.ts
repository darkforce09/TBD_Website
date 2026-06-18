import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing = false

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken && !refreshing) {
        refreshing = true
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          useAuthStore.getState().setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            user: useAuthStore.getState().user!,
            arma_linked: Boolean(useAuthStore.getState().user?.arma_id),
          })
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          useAuthStore.getState().clearSession()
        } finally {
          refreshing = false
        }
      }
    }
    return Promise.reject(error)
  },
)
