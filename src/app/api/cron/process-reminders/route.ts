import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/notifications/email'
import { sendTelegramMessage } from '@/lib/notifications/telegram'
import { sendWhatsAppReminder } from '@/lib/notifications/whatsapp'

export const runtime = 'edge'

export async function POST(request: Request) {
  // 1. Authenticate the cron request
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  // Standard token validation
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also support checking a query parameter for easier manual testing (e.g. ?secret=...)
    const { searchParams } = new URL(request.url)
    const querySecret = searchParams.get('secret')
    if (querySecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // 2. Check if Mock Mode is active
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    return NextResponse.json({ 
      success: true, 
      message: 'Mock Mode is active. Reminder triggers are simulated on the client dashboard.' 
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Database credentials not configured' }, { status: 500 })
  }

  // Create client with service role to bypass RLS policies
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 3. Fetch active reminders
    const { data: reminders, error: remError } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'active')

    if (remError) throw remError
    
    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ success: true, processed: 0 })
    }

    const now = new Date()
    const processedList = []

    for (const rem of reminders) {
      // Parse scheduled date-time in the reminder's target timezone
      const targetStr = `${rem.reminder_date}T${rem.reminder_time}:00`
      const localScheduledDate = new Date(targetStr)

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
      const localOffset = -new Date().getTimezoneOffset()
      const diffMinutes = offsetMinutes - localOffset
      const scheduledUtc = new Date(localScheduledDate.getTime() - diffMinutes * 60000)

      if (scheduledUtc.getTime() <= now.getTime()) {
        // Fetch user destination details
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', rem.user_id)
          .single()

        if (userError || !userProfile) {
          console.error(`User profile not found for reminder ${rem.id}`)
          continue
        }

        // Send notifications to each selected channel
        const channels = rem.notification_channels

        for (const channel of channels) {
          let deliveryStatus: 'sent' | 'failed' = 'sent'
          let errMsg = ''

          if (channel === 'email') {
            const emailHtml = `
              <div style="font-family: sans-serif; padding: 20px; background-color: #f9fafb; color: #111827;">
                <h2 style="color: #4f46e5; margin-bottom: 15px;">Reminder Alert: ${rem.title}</h2>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 14px; line-height: 1.5;">${rem.message || 'No additional details.'}</p>
                </div>
                <p style="font-size: 12px; color: #4b5563;">Scheduled for: ${rem.reminder_date} at ${rem.reminder_time} (${rem.timezone})</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
                <p style="font-size: 11px; color: #9ca3af;">Sent automatically by Alert.my.id. Stay Alert. Stay Ahead.</p>
              </div>
            `
            const res = await sendEmail(userProfile.email, `Alert: ${rem.title}`, emailHtml)
            if (!res.success) {
              deliveryStatus = 'failed'
              errMsg = res.error || 'Resend delivery failed'
            }
          } else if (channel === 'telegram') {
            if (userProfile.telegram_chat_id) {
              const text = `🔔 <b>Reminder Alert: ${rem.title}</b>\n\n${rem.message || 'No details.'}\n\n<i>Scheduled: ${rem.reminder_date} ${rem.reminder_time} (${rem.timezone})</i>`
              const res = await sendTelegramMessage(userProfile.telegram_chat_id, text)
              if (!res.success) {
                deliveryStatus = 'failed'
                errMsg = res.error || 'Telegram delivery failed'
              }
            } else {
              deliveryStatus = 'failed'
              errMsg = 'Telegram chat ID not configured by user'
            }
          } else if (channel === 'whatsapp') {
            if (userProfile.whatsapp_number) {
              const res = await sendWhatsAppReminder(userProfile.whatsapp_number, {
                title: rem.title,
                message: rem.message || 'No details.',
                date: rem.reminder_date,
                time: rem.reminder_time
              })
              if (!res.success) {
                deliveryStatus = 'failed'
                errMsg = res.error || 'WhatsApp delivery failed'
              }
            } else {
              deliveryStatus = 'failed'
              errMsg = 'WhatsApp phone number not configured by user'
            }
          }

          // Insert log entry
          await supabase.from('reminder_logs').insert({
            reminder_id: rem.id,
            channel: channel,
            delivery_status: deliveryStatus,
            error_message: errMsg || null
          })
        }

        // Update reminder status / recurrence
        let nextStatus: 'completed' | 'active' = 'completed'
        let nextDate = rem.reminder_date

        if (rem.recurring_type !== 'one_time') {
          nextStatus = 'active'
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

          const nextYear = dateObj.getFullYear()
          const nextMonth = String(dateObj.getMonth() + 1).padStart(2, '0')
          const nextDay = String(dateObj.getDate()).padStart(2, '0')
          nextDate = `${nextYear}-${nextMonth}-${nextDay}`
        }

        await supabase
          .from('reminders')
          .update({
            status: nextStatus,
            reminder_date: nextDate
          })
          .eq('id', rem.id)

        processedList.push(rem.id)
      }
    }

    return NextResponse.json({ success: true, processed: processedList.length, ids: processedList })
  } catch (err: any) {
    console.error('[Cron Error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Support GET requests for easy manual cron triggers in browser/curl
export async function GET(request: Request) {
  return POST(request)
}
