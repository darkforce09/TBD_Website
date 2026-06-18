export interface Announcement {
  id: string
  title: string
  summary?: string
  body?: string
  tag?: string
  author_name?: string
  published_at?: string
  thumbnail_url?: string
}

export interface DashboardResponse {
  next_event?: {
    event_id: string
    name: string
    terrain: string
    start_time: string
    registered: number
    max_slots: number
    status: string
  } | null
  my_assignment?: {
    event_id: string
    name: string
    faction: string
    squad: string
    role: string
  } | null
  server_status?: {
    is_online: boolean
    player_count: number
    max_players: number
    map_name?: string
  } | null
  current_modpack?: {
    name: string
    version: string
    size_gb: number
  } | null
  recent_announcements: Announcement[]
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: string
  user: import('@/types/models/user').User
  arma_linked: boolean
}

export interface LeaderboardRow {
  rank: number
  discord_id: string
  username: string
  avatar_url?: string
  kills?: number
  deaths?: number
  kd_ratio?: number
  value?: number
}

export interface LeaderboardResponse {
  category: string
  data: LeaderboardRow[]
}
