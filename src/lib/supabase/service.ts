import { createClient } from './client'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar: string
  telegram_chat_id?: string
  whatsapp_number?: string
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
  notification_channels: string[] // ['email', 'telegram', 'whatsapp']
  recurring_type: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface ReminderLog {
  id: string
  reminder_id: string
  sent_at: string
  channel: 'email' | 'telegram' | 'whatsapp'
  delivery_status: 'pending' | 'sent' | 'failed'
  error_message?: string
  reminder_title?: string // Populated on select
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
}

const defaultMockSubscription = (userId: string): Subscription => ({
  id: 'mock-sub-123',
  user_id: userId,
  plan_id: 'free_trial',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
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
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Fetch profile from public.users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !profile) {
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar: user.user_metadata?.avatar_url || '',
        }
      }
      return profile
    } catch {
      return null
    }
  },

  async signInWithGoogle(): Promise<{ success: boolean; url?: string }> {
    if (isMockMode) {
      // Simulate OAuth login
      setStorage(MOCK_USER_KEY, defaultMockUser)
      // Provision default trial subscription if not exists
      const sub = getStorage(MOCK_SUBSCRIPTION_KEY, null)
      if (!sub) {
        setStorage(MOCK_SUBSCRIPTION_KEY, defaultMockSubscription(defaultMockUser.id))
      }
      return { success: true, url: '/dashboard' }
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) throw error
    return { success: true, url: data.url }
  },

  async signOut(): Promise<void> {
    if (isMockMode) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(MOCK_USER_KEY)
      }
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
  },

  // --- Profile Settings ---
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isMockMode) {
      const user = getStorage(MOCK_USER_KEY, defaultMockUser)
      const updated = { ...user, ...updates }
      setStorage(MOCK_USER_KEY, updated)
      return updated
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // --- Subscriptions Service ---
  async getSubscription(userId: string): Promise<Subscription | null> {
    if (isMockMode) {
      return getStorage(MOCK_SUBSCRIPTION_KEY, defaultMockSubscription(userId))
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
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

    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planId,
        start_date: newSub.start_date,
        end_date: newSub.end_date,
        status: status,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // --- Reminders Service (CRUD) ---
  async getReminders(userId: string): Promise<Reminder[]> {
    if (isMockMode) {
      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      return all.filter(r => r.user_id === userId)
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'status'>): Promise<Reminder> {
    const user = await this.getUser()
    if (!user) throw new Error('Unauthorized')

    const newReminder: Reminder = {
      ...reminder,
      id: `rem-${Math.random().toString(36).substring(2, 11)}`,
      user_id: user.id,
      status: 'active',
      created_at: new Date().toISOString(),
    }

    if (isMockMode) {
      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      all.unshift(newReminder)
      setStorage(MOCK_REMINDERS_KEY, all)
      return newReminder
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        title: reminder.title,
        message: reminder.message,
        reminder_date: reminder.reminder_date,
        reminder_time: reminder.reminder_time,
        timezone: reminder.timezone,
        notification_channels: reminder.notification_channels,
        recurring_type: reminder.recurring_type,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
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

    const supabase = createClient()
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteReminder(id: string): Promise<boolean> {
    if (isMockMode) {
      const all = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      const filtered = all.filter(r => r.id !== id)
      setStorage(MOCK_REMINDERS_KEY, filtered)
      return true
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // --- Reminder Logs Service ---
  async getReminderLogs(userId: string): Promise<ReminderLog[]> {
    if (isMockMode) {
      const logs = getStorage<ReminderLog[]>(MOCK_LOGS_KEY, [])
      const reminders = getStorage<Reminder[]>(MOCK_REMINDERS_KEY, [])
      
      // Filter logs of reminders belonging to this user
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

    const supabase = createClient()
    // Select logs and join reminder title
    const { data, error } = await supabase
      .from('reminder_logs')
      .select(`
        id,
        reminder_id,
        sent_at,
        channel,
        delivery_status,
        error_message,
        reminders!inner (
          title,
          user_id
        )
      `)
      .eq('reminders.user_id', userId)
      .order('sent_at', { ascending: false })

    if (error) throw error
    
    // Map database shape to our clean interface
    return (data || []).map((l: unknown) => {
      const item = l as {
        id: string
        reminder_id: string
        sent_at: string
        channel: 'email' | 'telegram' | 'whatsapp'
        delivery_status: 'pending' | 'sent' | 'failed'
        error_message?: string
        reminders?: { title: string }
      }
      return {
        id: item.id,
        reminder_id: item.reminder_id,
        sent_at: item.sent_at,
        channel: item.channel,
        delivery_status: item.delivery_status,
        error_message: item.error_message,
        reminder_title: item.reminders?.title || 'Unknown Reminder',
      }
    })
  },

  // Helper to trigger a manual log (useful for testing simulated triggers)
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
