export interface UserProfile {
  id: string
  email: string
  name: string
  avatar: string
  telegram_chat_id?: string
  whatsapp_number?: string
  google_sync_enabled?: boolean
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  message: string
  reminder_date: string // YYYY-MM-DD
  reminder_time: string // HH:MM
  timezone: string
  notification_channels: string[] // ['telegram', 'whatsapp']
  recurring_type: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface ReminderLog {
  id: string
  reminder_id: string
  sent_at: string
  channel: 'telegram' | 'whatsapp'
  delivery_status: 'pending' | 'sent' | 'failed'
  error_message?: string
  reminder_title?: string
}

export const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

// LocalStorage Keys for Mocking
const MOCK_USER_KEY = 'alert_mock_user'
const MOCK_SUBSCRIPTION_KEY = 'alert_mock_subscription'
const MOCK_REMINDERS_KEY = 'alert_mock_reminders'
const MOCK_LOGS_KEY = 'alert_mock_logs'

const defaultMockUser: UserProfile = {
  id: 'mock-user-123',
  email: 'hello@alert.my.id',
  name: 'Adrian Rizqi',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80',
  telegram_chat_id: '',
  whatsapp_number: '',
  google_sync_enabled: false,
}

const defaultMockSubscription = (userId: string): Subscription => ({
  id: 'mock-sub-123',
  user_id: userId,
  plan_id: 'free_trial',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'trialing',
})

// LocalStorage Helpers
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const item = localStorage.getItem(key)
  return item ? JSON.parse(item) : defaultValue
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export const supabaseService = {
  // --- Auth Service ---
  async getUser(): Promise<UserProfile | null> {
    if (isMockMode) {
      if (typeof window === 'undefined') return defaultMockUser
      const user = localStorage.getItem(MOCK_USER_KEY)
      if (!user) return null
      return JSON.parse(user)
    }

    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) return null
      const data = await res.json()
      return data.user || null
    } catch {
      return null
    }
  },

  async signInWithGoogle(): Promise<{ success: boolean; url?: string }> {
    if (isMockMode) {
      setStorage(MOCK_USER_KEY, defaultMockUser)
      const sub = getStorage(MOCK_SUBSCRIPTION_KEY, null)
      if (!sub) {
        setStorage(MOCK_SUBSCRIPTION_KEY, defaultMockSubscription(defaultMockUser.id))
      }
      return { success: true, url: '/dashboard' }
    }

    return { success: true, url: '/api/auth/google' }
  },

  async signOut(): Promise<void> {
    if (isMockMode) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(MOCK_USER_KEY)
      }
      return
    }

    await fetch('/api/auth/logout', { method: 'POST' })
  },

  // --- Profile Settings ---
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isMockMode) {
      const user = getStorage(MOCK_USER_KEY, defaultMockUser)
      const updated = { ...user, ...updates }
      setStorage(MOCK_USER_KEY, updated)
      return updated
    }

    const res = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) throw new Error('Failed to update settings')
    return updates as UserProfile
  },

  // --- Subscriptions Service ---
  async getSubscription(userId: string): Promise<Subscription | null> {
    if (isMockMode) {
      return getStorage(MOCK_SUBSCRIPTION_KEY, defaultMockSubscription(userId))
    }

    const res = await fetch('/api/subscription')
    if (!res.ok) return null
    return res.json()
  },

  async updateSubscription(userId: string, planId: string, status: Subscription['status'], durationDays = 365): Promise<Subscription> {
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      user_id: userId,
      plan_id: planId,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: status,
    }

    if (isMockMode) {
      setStorage(MOCK_SUBSCRIPTION_KEY, newSub)
      return newSub
    }

    // Stripe checkout updates this in D1. 
    return newSub
  },

  // --- Reminders Service (CRUD) ---
  async getReminders(userId: string): Promise<Reminder[]> {
    if (isMockMode) {
      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      return all.filter(r => r.user_id === userId)
    }

    const res = await fetch('/api/reminders')
    if (!res.ok) return []
    return res.json()
  },

  async createReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'status'>): Promise<Reminder> {
    if (isMockMode) {
      const user = await this.getUser()
      if (!user) throw new Error('Unauthorized')

      const newReminder: Reminder = {
        ...reminder,
        id: `rem-${Math.random().toString(36).substring(2, 11)}`,
        user_id: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
      }

      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      all.unshift(newReminder)
      setStorage(MOCK_REMINDERS_KEY, all)
      return newReminder
    }

    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder)
    })

    if (!res.ok) {
      const errData = await res.json() as any
      throw new Error(errData.error || 'Failed to create reminder')
    }
    return res.json()
  },

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    if (isMockMode) {
      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      const idx = all.findIndex(r => r.id === id)
      if (idx === -1) throw new Error('Reminder not found')
      
      const updated = { ...all[idx], ...updates } as Reminder
      all[idx] = updated
      setStorage(MOCK_REMINDERS_KEY, all)
      return updated
    }

    const res = await fetch(`/api/reminders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) throw new Error('Failed to update reminder')
    return updates as Reminder
  },

  async deleteReminder(id: string): Promise<boolean> {
    if (isMockMode) {
      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      const filtered = all.filter(r => r.id !== id)
      setStorage(MOCK_REMINDERS_KEY, filtered)
      return true
    }

    const res = await fetch(`/api/reminders/${id}`, {
      method: 'DELETE'
    })
    return res.ok
  },

  // --- Reminder Logs Service ---
  async getReminderLogs(userId: string): Promise<ReminderLog[]> {
    if (isMockMode) {
      const logs = getStorage<ReminderLog[]>(MOCK_LOGS_KEY, [])
      const reminders = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      
      const userReminderIds = new Set(reminders.filter(r => r.user_id === userId).map(r => r.id))
      return logs
        .filter(l => userReminderIds.has(l.reminder_id))
        .map(l => {
          const rem = reminders.find(r => r.id === l.reminder_id)
          return {
            ...l,
            reminder_title: rem ? rem.title : 'Deleted Reminder',
          }
        })
        .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
    }

    const res = await fetch('/api/reminders/logs')
    if (!res.ok) return []
    return res.json()
  },

  async addMockLog(log: Omit<ReminderLog, 'id' | 'sent_at'>): Promise<ReminderLog> {
    const newLog: ReminderLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sent_at: new Date().toISOString(),
    }
    const logs = getStorage<ReminderLog[]>(MOCK_LOGS_KEY, [])
    logs.unshift(newLog)
    setStorage(MOCK_LOGS_KEY, logs)
    return newLog
  }
}
