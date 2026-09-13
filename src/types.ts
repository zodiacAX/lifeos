export type AttributeKey = 'intelligence' | 'strength' | 'discipline' | 'health' | 'focus'

export interface User {
  id: number
  username: string
  display_name: string
  level: number
  xp: number
  xp_next: number
  credits: number
  streak_days: number
  momentum: number
  attributes: Record<AttributeKey, number>
  available_points: number
}

export interface Quest {
  id: number
  title: string
  description: string
  category: AttributeKey
  difficulty: 'easy' | 'medium' | 'hard'
  xp_reward: number
  credit_reward: number
  progress: number
  target: number
  status: 'active' | 'completed'
  repeat_rule: 'once' | 'daily' | 'weekly'
  created_at: string
  completed_at?: string | null
}

export interface Reward {
  id: number
  name: string
  description: string
  cost: number
  kind: 'real_life' | 'cosmetic'
  slot?: 'jacket' | 'goggles' | 'boots' | 'hair' | 'cybernetic' | 'badge' | null
  owned: boolean
  equipped: boolean
}

export interface JournalEntry {
  id: number
  title: string
  xp: number
  credits: number
  category: AttributeKey
  completed_at: string
}

export interface Dashboard {
  user: User
  quests: Quest[]
  rewards: Reward[]
  journal: JournalEntry[]
  weekly_completed: number
  weekly_goal: number
}

export interface CompleteResult {
  quest: Quest
  user: User
  level_up: boolean
  old_level: number
  new_level: number
  xp_gained: number
  credits_gained: number
}

export interface HealthStatus {
  status: string
  system: string
  version: string
  database: {
    ready: boolean
    persistent: boolean
    mode: 'postgres' | 'ephemeral-preview' | 'sqlite-local' | string
  }
}
