'use client'

import { useEffect } from 'react'
import { supabaseService, isMockMode } from '@/lib/supabase/service'
// No date-fns-tz import needed

export function useMockScheduler(userId: string | undefined, onRefresh: () => void) {
  useEffect(() => {
    if (!isMockMode || !userId) return

    const checkReminders = async () => {
      try {
        const reminders = await supabaseService.getReminders(userId)
        const active = reminders.filter(r => r.status === 'active')
        const now = new Date()
        let didTrigger = false

        for (const rem of active) {
          // Parse the scheduled local date and time in the reminder's target timezone
          const targetStr = `${rem.reminder_date}T${rem.reminder_time}:00`
          
          // Use standard javascript date-fns timezone calculations
          // Construct target Date representation in UTC
          const localScheduledDate = new Date(targetStr)
          
          // Compute difference based on timezone offset
          // In JavaScript, we can parse this by appending the timezone or by converting
          // Since date-fns-tz v2/v3 is used, toZonedTime is the correct modern helper.
          // Let's perform a robust comparison:
          // Construct target timestamp as if it were in the target timezone:
          // For example, if targetStr is '2026-06-05T14:00:00' in 'Asia/Jakarta' (GMT+7):
          // The UTC time of this is 7 hours earlier: '2026-06-05T07:00:00Z'.
          
          // Clean custom parser for timezones:
          const getOffsetMinutes = (tz: string) => {
            try {
              const date = new Date()
              const tzString = date.toLocaleString('en-US', { timeZone: tz })
              const tzDate = new Date(tzString)
              return (tzDate.getTime() - date.getTime()) / 60000
            } catch {
              return 0
            }
          }

          const offsetMinutes = getOffsetMinutes(rem.timezone)
          // localScheduledDate interprets string in browser local time.
          // To get the exact UTC representation of the string in the scheduled timezone:
          // targetUtcMs = targetLocalMs - (scheduledTimezoneOffset - browserLocalTimezoneOffset)
          const localOffset = -new Date().getTimezoneOffset()
          const diffMinutes = offsetMinutes - localOffset
          const scheduledUtc = new Date(localScheduledDate.getTime() - diffMinutes * 60000)

          if (scheduledUtc.getTime() <= now.getTime()) {
            console.log(`[Mock Scheduler] Triggering reminder: "${rem.title}"`)
            didTrigger = true

            // Calculate status updates
            let nextStatus: 'completed' | 'active' = 'completed'
            let nextDate = rem.reminder_date

            if (rem.recurring_type !== 'one_time') {
              nextStatus = 'active'
              
              // Calculate next date (daily, weekly, monthly, yearly)
              const [year, month, day] = rem.reminder_date.split('-').map(Number)
              const dateObj = new Date(year, month - 1, day)
              
              if (rem.recurring_type === 'daily') {
                dateObj.setDate(dateObj.getDate() + 1)
              } else if (rem.recurring_type === 'weekly') {
                dateObj.setDate(dateObj.getDate() + 7)
              } else if (rem.recurring_type === 'monthly') {
                dateObj.setMonth(dateObj.getMonth() + 1)
              } else if (rem.recurring_type === 'yearly') {
                dateObj.setFullYear(dateObj.getFullYear() + 1)
              }
              
              // Format back as YYYY-MM-DD
              const nextYear = dateObj.getFullYear()
              const nextMonth = String(dateObj.getMonth() + 1).padStart(2, '0')
              const nextDay = String(dateObj.getDate()).padStart(2, '0')
              nextDate = `${nextYear}-${nextMonth}-${nextDay}`
            }

            // Update Database/LocalStorage
            await supabaseService.updateReminder(rem.id, {
              status: nextStatus,
              reminder_date: nextDate,
            })

            // Log deliveries
            for (const channel of rem.notification_channels) {
              await supabaseService.addMockLog({
                reminder_id: rem.id,
                channel: channel as 'telegram' | 'whatsapp',
                delivery_status: 'sent',
              })
            }

            // Dispatch custom trigger notification
            window.dispatchEvent(new CustomEvent('reminder-triggered', {
              detail: {
                id: rem.id,
                title: rem.title,
                message: rem.message,
                channels: rem.notification_channels,
              }
            }))
          }
        }

        if (didTrigger) {
          onRefresh()
        }
      } catch (err) {
        console.error('Error running background scheduler checks:', err)
      }
    }

    const interval = setInterval(checkReminders, 5000)
    return () => clearInterval(interval)
  }, [userId, onRefresh])
}
