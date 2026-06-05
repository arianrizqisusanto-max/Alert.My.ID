'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabaseService } from '@/lib/supabase/service'
import { timezones, getBrowserTimezone } from '@/lib/timezones'
import { 
  Bell, Mail, Send, MessageSquare, ArrowLeft, 
  AlertTriangle, Calendar, Clock, Globe, HelpCircle, Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function CreateReminder() {
  const { user, subscription } = useAuth()
  const router = useRouter()
  
  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [channels, setChannels] = useState<string[]>(['email'])
  const [recurringType, setRecurringType] = useState<'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('one_time')
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto detect timezone and set default date
  useEffect(() => {
    const tz = getBrowserTimezone()
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const defaultDate = `${yyyy}-${mm}-${dd}`
    const hours = String((today.getHours() + 1) % 24).padStart(2, '0')
    const defaultTime = `${hours}:00`

    setTimeout(() => {
      setTimezone(tz)
      setDate(defaultDate)
      setTime(defaultTime)
    }, 0)
  }, [])

  const handleChannelToggle = (ch: string) => {
    if (channels.includes(ch)) {
      // Don't allow empty channels list
      if (channels.length === 1) return
      setChannels(channels.filter(c => c !== ch))
    } else {
      setChannels([...channels, ch])
    }
  }

  // Subscription gate check
  const isWhatsAppDisabled = subscription?.plan_id === 'basic'
  const isTelegramLinked = !!user?.telegram_chat_id
  const isWhatsAppLinked = !!user?.whatsapp_number

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time) return
    setError(null)
    setSaving(true)

    // Validation checks
    if (channels.includes('whatsapp') && isWhatsAppDisabled) {
      setError('WhatsApp notifications require the WhatsApp Pro plan.')
      setSaving(false)
      return
    }

    try {
      await supabaseService.createReminder({
        title,
        message,
        reminder_date: date,
        reminder_time: time,
        timezone,
        notification_channels: channels,
        recurring_type: recurringType
      })
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      const errorObj = err as Error
      setError(errorObj.message || 'Failed to create reminder. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Reminders</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Reminder</h1>
        <p className="text-xs text-slate-400 mt-1">Set up a new notification alert across your connected channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form panel */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-900">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reminder Title */}
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-xs font-semibold text-slate-350">
                  Reminder Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Call client for project review"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-slate-355">
                  Reminder Details / Message
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Optional details (links, notes, phone numbers, or context)..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                ></textarea>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="date" className="text-xs font-semibold text-slate-350 flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Date <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="time" className="text-xs font-semibold text-slate-350 flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Time <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Timezone & Recurrence Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="timezone" className="text-xs font-semibold text-slate-350 flex items-center space-x-1">
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    <span>Timezone</span>
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value} className="bg-slate-950">
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="recurrence" className="text-xs font-semibold text-slate-350 flex items-center space-x-1">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                    <span>Recurrence Freq</span>
                  </label>
                  <select
                    id="recurrence"
                    value={recurringType}
                    onChange={(e) => setRecurringType(e.target.value as 'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors cursor-pointer"
                  >
                    <option value="one_time" className="bg-slate-950">One-time Reminder</option>
                    <option value="daily" className="bg-slate-950">Daily</option>
                    <option value="weekly" className="bg-slate-950">Weekly</option>
                    <option value="monthly" className="bg-slate-950">Monthly</option>
                    <option value="yearly" className="bg-slate-950">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-350">
                  Notification Channels (Select at least one)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Email Channel */}
                  <button
                    type="button"
                    onClick={() => handleChannelToggle('email')}
                    className={`flex items-center justify-between p-4 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      channels.includes('email')
                        ? 'bg-blue-950/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Mail className="h-4 w-4" />
                      <span>Email Alert</span>
                    </div>
                    <span className="text-[10px] opacity-75">Free</span>
                  </button>

                  {/* Telegram Channel */}
                  <button
                    type="button"
                    onClick={() => handleChannelToggle('telegram')}
                    className={`flex items-center justify-between p-4 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      channels.includes('telegram')
                        ? 'bg-sky-950/20 border-sky-500/50 text-sky-300'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Send className="h-4 w-4" />
                      <span>Telegram Alert</span>
                    </div>
                    <span className="text-[10px] opacity-75">Free</span>
                  </button>

                  {/* WhatsApp Channel */}
                  <button
                    type="button"
                    disabled={isWhatsAppDisabled}
                    onClick={() => handleChannelToggle('whatsapp')}
                    className={`flex items-center justify-between p-4 rounded-xl border text-xs font-semibold transition-all duration-150 relative cursor-pointer ${
                      isWhatsAppDisabled
                        ? 'opacity-40 bg-slate-950 border-slate-900 text-slate-500 cursor-not-allowed'
                        : channels.includes('whatsapp')
                          ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp Alert</span>
                    </div>
                    {isWhatsAppDisabled ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-900/30 text-violet-400 font-bold uppercase tracking-wider shrink-0">
                        Pro
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-75">Pro / Trial</span>
                    )}
                  </button>
                </div>

                {/* Info and Warning alerts about channels setup */}
                {channels.includes('telegram') && !isTelegramLinked && (
                  <div className="p-3.5 rounded-xl bg-sky-950/10 border border-sky-900/20 text-sky-400 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span>Your Telegram account is not linked yet. You will not receive alerts. </span>
                      <Link href="/dashboard/settings" className="underline font-bold hover:text-sky-350">
                        Link Telegram now in settings
                      </Link>
                    </div>
                  </div>
                )}

                {channels.includes('whatsapp') && !isWhatsAppDisabled && !isWhatsAppLinked && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-900/20 text-emerald-450 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span>Your WhatsApp phone number is not configured yet. </span>
                      <Link href="/dashboard/settings" className="underline font-bold hover:text-emerald-300">
                        Set WhatsApp number in settings
                      </Link>
                    </div>
                  </div>
                )}

                {channels.includes('whatsapp') && isWhatsAppDisabled && (
                  <div className="p-3.5 rounded-xl bg-violet-950/10 border border-violet-900/20 text-violet-400 text-[11px] flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span>WhatsApp notifications are disabled because you are on the Basic Plan. </span>
                      <Link href="/dashboard/billing" className="underline font-bold hover:text-violet-350">
                        Upgrade to WhatsApp Pro
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scheduling Reminder...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      <span>Set Reminder Alert</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-5">
          <div className="glass-card rounded-3xl p-5 border border-slate-900 text-xs text-slate-350 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-violet-400" />
              <span>Reminder Delivery Tips</span>
            </h3>
            
            <div className="space-y-3.5">
              <div>
                <h4 className="font-semibold text-white">Timezone Accuracy</h4>
                <p className="text-slate-400 mt-1 leading-normal">
                  Make sure you pick the timezone that corresponds to the event destination. We handle daylight savings automatically.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Recurrences</h4>
                <p className="text-slate-400 mt-1 leading-normal">
                  A recurring reminder stays active indefinitely. Each time it triggers, it sets its date forward. You can pause or delete it at any time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Deliveries Log</h4>
                <p className="text-slate-400 mt-1 leading-normal">
                  Track whether your reminder reached your email or devices by checking the logs table on the main dashboard page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
