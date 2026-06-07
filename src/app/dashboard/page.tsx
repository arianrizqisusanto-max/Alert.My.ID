'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabaseService, Reminder, ReminderLog } from '@/lib/supabase/service'
import { useMockScheduler } from '@/lib/use-mock-scheduler'
import { 
  Plus, Search, Calendar, Bell, Mail, Send, MessageSquare, 
  Trash2, ToggleLeft, ToggleRight, CheckCircle2, XCircle, 
  Clock, RefreshCcw, BellOff, Filter, Loader2, History
} from 'lucide-react'

interface TriggerEventDetail {
  id: string
  title: string
  message: string
  channels: string[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [logs, setLogs] = useState<ReminderLog[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  // Live Toast Notification state
  const [toasts, setToasts] = useState<TriggerEventDetail[]>([])

  const fetchWorkspaceData = async () => {
    if (!user) return
    try {
      const rems = await supabaseService.getReminders(user.id)
      setReminders(rems)
      const lgList = await supabaseService.getReminderLogs(user.id)
      setLogs(lgList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Reload data
  useEffect(() => {
    setTimeout(() => {
      fetchWorkspaceData()
    }, 0)
  }, [user])

  // Setup the mock background cron runner (only runs if NEXT_PUBLIC_MOCK_MODE=true)
  useMockScheduler(user?.id, fetchWorkspaceData)

  // Listen for live triggers in mock mode
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<TriggerEventDetail>
      const detail = customEvent.detail
      
      // Add toast
      setToasts(prev => [detail, ...prev])
      
      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== detail.id))
      }, 7000)

      // Refresh DB data
      fetchWorkspaceData()
    }

    window.addEventListener('reminder-triggered', handleTrigger)
    return () => {
      window.removeEventListener('reminder-triggered', handleTrigger)
    }
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return
    try {
      await supabaseService.deleteReminder(id)
      fetchWorkspaceData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStatus = async (reminder: Reminder) => {
    const nextStatus = reminder.status === 'active' ? 'cancelled' : 'active'
    try {
      await supabaseService.updateReminder(reminder.id, { status: nextStatus })
      fetchWorkspaceData()
    } catch (err) {
      console.error(err)
    }
  }

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'telegram': return <Send className="h-3.5 w-3.5 text-sky-400" />
      case 'whatsapp': return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
      default: return <Bell className="h-3.5 w-3.5 text-slate-400" />
    }
  }

  // Filters calculation
  const filteredReminders = reminders.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Statistics
  const activeCount = reminders.filter(r => r.status === 'active').length
  const completedCount = reminders.filter(r => r.status === 'completed').length
  const failedLogsCount = logs.filter(l => l.delivery_status === 'failed').length
  const successRate = logs.length > 0 
    ? Math.round(((logs.length - failedLogsCount) / logs.length) * 100) 
    : 100

  return (
    <div className="space-y-8 relative">
      
      {/* Dynamic Toast Notifications (Alert popup when background cron triggers) */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm">
        {toasts.map((toast, tIdx) => (
          <div key={tIdx} className="glass-card border-violet-500/40 p-5 rounded-2xl flex items-start space-x-3.5 shadow-2xl animate-float relative overflow-hidden bg-slate-900/90">
            <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-violet-500 to-pink-500"></div>
            <div className="p-2 bg-violet-950/40 rounded-xl text-violet-400 shrink-0">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Alert Triggered!</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  Live
                </span>
              </h4>
              <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{toast.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{toast.message || 'No description provided.'}</p>
              <div className="mt-3 flex items-center space-x-2 pt-2 border-t border-slate-800/60">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Channels Sent:</span>
                <div className="flex space-x-1.5">
                  {toast.channels.map(ch => (
                    <span key={ch} className="p-1 rounded bg-slate-800" title={ch}>
                      {getChannelIcon(ch)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-500 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-violet-400 font-bold">{user?.name}</span>! Monitor and manage your alerts.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center space-x-2 shadow-lg shadow-indigo-650/15"
        >
          <Plus className="h-4 w-4" />
          <span>New Reminder</span>
        </Link>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 flex items-center space-x-4 border border-slate-900/60">
          <div className="p-3 bg-violet-950/20 border border-violet-900/20 rounded-xl text-violet-450">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Reminders</div>
            <div className="text-xl font-bold text-white mt-0.5">{activeCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center space-x-4 border border-slate-900/60">
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/20 rounded-xl text-emerald-450">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Alerts</div>
            <div className="text-xl font-bold text-white mt-0.5">{completedCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center space-x-4 border border-slate-900/60">
          <div className="p-3 bg-blue-950/20 border border-blue-900/20 rounded-xl text-blue-450">
            <RefreshCcw className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Rate</div>
            <div className="text-xl font-bold text-white mt-0.5">{successRate}%</div>
          </div>
        </div>
      </div>

      {/* Reminders section header + search filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Scheduled Reminders</span>
            <span className="text-xs py-0.5 px-2 bg-slate-900 text-slate-400 rounded-full border border-slate-800">
              {filteredReminders.length}
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-550" />
              <input
                type="text"
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500/40"
              />
            </div>

            {/* Filter select */}
            <div className="flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-3">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed' | 'cancelled')}
                className="bg-transparent border-0 text-xs font-semibold text-slate-350 focus:outline-none pr-6 cursor-pointer py-1.5"
              >
                <option value="all" className="bg-slate-950">All Status</option>
                <option value="active" className="bg-slate-950">Active</option>
                <option value="completed" className="bg-slate-950">Completed</option>
                <option value="cancelled" className="bg-slate-950">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reminders List Grid */}
        {loading ? (
          <div className="text-center py-10 glass-card rounded-3xl">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Retrieving alert listings...</p>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-10 glass-card rounded-3xl border-dashed border-slate-850">
            <BellOff className="h-10 w-10 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-300">No Reminders Found</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or status filter to see other results.' 
                : 'Get started by creating your very first reminder alert. It takes less than 10 seconds!'}
            </p>
            {!(searchTerm || statusFilter !== 'all') && (
              <Link
                href="/dashboard/create"
                className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-550 text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Reminder</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredReminders.map((rem) => {
              const isActiveStatus = rem.status === 'active'
              const isCompletedStatus = rem.status === 'completed'

              return (
                <div 
                  key={rem.id} 
                  className={`glass-card rounded-3xl p-6 flex flex-col justify-between border transition-all duration-200 ${
                    isActiveStatus 
                      ? 'border-slate-850 hover:border-slate-800/80' 
                      : isCompletedStatus 
                        ? 'border-emerald-950/20 opacity-70 bg-emerald-950/5' 
                        : 'border-red-950/20 opacity-60 bg-red-950/5'
                  }`}
                >
                  <div>
                    {/* Card Title & Badges */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`font-bold text-sm ${isCompletedStatus ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {rem.title}
                      </h3>
                      
                      {/* Status pill badge */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActiveStatus 
                          ? 'bg-violet-950/35 text-violet-400 border border-violet-900/30' 
                          : isCompletedStatus 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                            : 'bg-red-950/40 text-red-400 border border-red-900/30'
                      }`}>
                        {rem.status}
                      </span>
                    </div>

                    {/* Date/Time alert summary info */}
                    <div className="flex items-center space-x-1.5 mt-3 text-[10px] text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                      <span className="font-semibold text-slate-300">
                        {rem.reminder_date} at {rem.reminder_time}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 truncate max-w-[100px]" title={rem.timezone}>
                        {rem.timezone.split('/')[1]?.replace('_', ' ') || rem.timezone}
                      </span>
                    </div>

                    {/* Description Text */}
                    {rem.message && (
                      <p className={`text-[11px] mt-3 leading-relaxed line-clamp-3 ${
                        isCompletedStatus ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {rem.message}
                      </p>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between">
                    {/* Recurrence & Channels indicators */}
                    <div className="flex items-center space-x-3.5">
                      <span className="text-[10px] font-bold text-slate-550 capitalize bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-850">
                        {rem.recurring_type.replace('_', ' ')}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {rem.notification_channels.map(ch => (
                          <span key={ch} className="p-1 rounded bg-slate-900 border border-slate-850" title={ch}>
                            {getChannelIcon(ch)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Active/Cancelled Toggle button */}
                      {!isCompletedStatus && (
                        <button
                          onClick={() => handleToggleStatus(rem)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title={isActiveStatus ? 'Pause alert' : 'Resume alert'}
                        >
                          {isActiveStatus ? (
                            <ToggleRight className="h-4.5 w-4.5 text-violet-400" />
                          ) : (
                            <ToggleLeft className="h-4.5 w-4.5 text-slate-500" />
                          )}
                        </button>
                      )}
                      
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(rem.id)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reminder History Log Section */}
      <div className="pt-6 border-t border-slate-900">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <History className="h-5 w-5 text-slate-450" />
          <span>Notification History Logs</span>
        </h2>

        {logs.length === 0 ? (
          <div className="text-center py-10 glass-card rounded-2xl bg-slate-950/10">
            <p className="text-xs text-slate-500">No notification logs recorded yet.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/40 border-b border-slate-900/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Time Sent</th>
                    <th className="p-4">Reminder Title</th>
                    <th className="p-4">Channel</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-xs text-slate-350">
                  {logs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/10 transition-colors">
                      <td className="p-4 text-[10px] text-slate-550 font-medium">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                      <td className="p-4 font-semibold text-slate-200 truncate max-w-[150px]">
                        {log.reminder_title}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded border border-slate-850">
                          {getChannelIcon(log.channel)}
                          <span className="text-[10px] capitalize font-medium text-slate-400">{log.channel}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {log.delivery_status === 'sent' ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-450 text-[10px] font-bold bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            <span>Delivered</span>
                          </span>
                        ) : log.delivery_status === 'pending' ? (
                          <span className="inline-flex items-center space-x-1 text-yellow-450 text-[10px] font-bold bg-yellow-950/20 border border-yellow-900/30 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-red-450 text-[10px] font-bold bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded-full" title={log.error_message}>
                            <XCircle className="h-3 w-3 shrink-0" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logs.length > 8 && (
              <div className="p-3 text-center border-t border-slate-900 bg-slate-950/30">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Showing 8 most recent notification dispatches
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
