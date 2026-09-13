import type { CompleteResult, Dashboard, HealthStatus, Quest, Reward, User } from './types'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      credentials: 'include',
      headers: { ...jsonHeaders, ...(init.headers || {}) },
    })
  } catch {
    throw new Error('LIFE//OS server is unreachable. Check the deployment or local API process.')
  }

  const raw = await res.text()
  let body: any = null
  if (raw) {
    try { body = JSON.parse(raw) } catch { body = null }
  }

  if (!res.ok) {
    const message = body?.detail || body?.message ||
      (res.status >= 500
        ? 'Cloud service is unavailable. If this is Vercel, connect Postgres and redeploy.'
        : 'Request failed')
    throw new Error(message)
  }

  if (res.status === 204 || !raw) return undefined as T
  return body as T
}

export const api = {
  health: () => request<HealthStatus>('/health'),
  me: () => request<User>('/auth/me'),
  login: (username: string, password: string) => request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, display_name: string, password: string) => request<User>('/auth/register', { method: 'POST', body: JSON.stringify({ username, display_name, password }) }),
  demo: () => request<User>('/auth/demo', { method: 'POST' }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  dashboard: () => request<Dashboard>('/dashboard'),
  createQuest: (payload: Partial<Quest>) => request<Quest>('/quests', { method: 'POST', body: JSON.stringify(payload) }),
  updateQuest: (id: number, payload: Partial<Quest>) => request<Quest>(`/quests/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteQuest: (id: number) => request<void>(`/quests/${id}`, { method: 'DELETE' }),
  completeQuest: (id: number) => request<CompleteResult>(`/quests/${id}/complete`, { method: 'POST' }),
  purchaseReward: (id: number) => request<{ reward: Reward; user: User }>(`/rewards/${id}/purchase`, { method: 'POST' }),
  equipReward: (id: number) => request<Reward>(`/rewards/${id}/equip`, { method: 'POST' }),
  allocateStat: (attribute: string) => request<User>('/character/allocate', { method: 'POST', body: JSON.stringify({ attribute }) }),
}
