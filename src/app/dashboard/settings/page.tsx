'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabaseService } from '@/lib/supabase/service'
import { 
  Send, MessageSquare, CheckCircle2, AlertTriangle, 
  Loader2, Save, ArrowUpRight 
} from 'lucide-react'

export default function ChannelSettings() {
  const { user, refreshUser } = useAuth()
  
  // Settings Form State
  const [waNumber, setWaNumber] = useState('')
  const [mockChatId, setMockChatId] = useState('')
  
  const [savingWa, setSavingWa] = useState(false)
  const [linkingTg, setLinkingTg] = useState(false)
  
  const [waSuccess, setWaSuccess] = useState(false)
  const [tgSuccess, setTgSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setWaNumber(user.whatsapp_number || '')
        setMockChatId(user.telegram_chat_id || '')
      }, 0)
    }
  }, [user])

  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'AlertMyIdBot'

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSavingWa(true)
    setWaSuccess(false)

    // Format WA number: strip everything except digits
    const cleaned = waNumber.replace(/\D/g, '')
    if (waNumber && cleaned.length < 9) {
      setError('Please enter a valid phone number with country code (e.g. 628123456789).')
      setSavingWa(false)
      return
    }

    try {
      await supabaseService.updateUserProfile(user.id, {
        whatsapp_number: cleaned
      })
      await refreshUser()
      setWaSuccess(true)
      setTimeout(() => setWaSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      const errorCast = err as Error
      setError(errorCast.message || 'Failed to update WhatsApp settings.')
    } finally {
      setSavingWa(false)
    }
  }

  // Links real Telegram Bot
  const getTelegramBotLink = () => {
    if (!user) return '#'
    return `https://t.me/${botName}?start=${user.id}`
  }

  // Simulated link for Mock Mode
  const handleSimulateTelegramLink = async () => {
    if (!user) return
    setError(null)
    setLinkingTg(true)
    setTgSuccess(false)

    try {
      const dummyId = mockChatId.trim() || Math.floor(100000000 + Math.random() * 900000000).toString()
      await supabaseService.updateUserProfile(user.id, {
        telegram_chat_id: dummyId
      })
      await refreshUser()
      setTgSuccess(true)
      setMockChatId(dummyId)
      setTimeout(() => setTgSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to simulate Telegram linkage.')
    } finally {
      setLinkingTg(false)
    }
  }

  const handleDisconnectTelegram = async () => {
    if (!user || !confirm('Are you sure you want to disconnect Telegram alerts?')) return
    try {
      await supabaseService.updateUserProfile(user.id, {
        telegram_chat_id: ''
      })
      await refreshUser()
      setMockChatId('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Channel Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure your Telegram bot link and WhatsApp contact targets.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Telegram Integration Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-sky-950/20 border border-sky-900/20 rounded-xl text-sky-450">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Telegram Integration</h3>
                <p className="text-[10px] text-slate-500">Receive alerts inside Telegram direct messages</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-normal">
              To receive alerts, link your Telegram profile. You will start a conversation with our notification bot which maps to your user ID.
            </p>

            {/* Status indicators */}
            {user?.telegram_chat_id ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-900/20 text-emerald-450 text-[11px] flex items-center space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>Linked Chat ID: <strong>{user.telegram_chat_id}</strong></span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 text-[11px] flex items-center space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-slate-500" />
                <span>Not linked. Alerts to Telegram will fail.</span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-900/60 mt-6">
            {user?.telegram_chat_id ? (
              <button
                onClick={handleDisconnectTelegram}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center border border-red-950 text-red-400 hover:bg-red-950/20 transition-colors"
              >
                Disconnect Telegram Bot
              </button>
            ) : (
              <div className="space-y-3">
                <a
                  href={getTelegramBotLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-center bg-sky-600 hover:bg-sky-550 text-white flex items-center justify-center space-x-2 shadow-lg shadow-sky-650/15"
                >
                  <span>Link via Official Telegram Bot</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>

                {/* Simulated Link for Mock Mode */}
                {process.env.NEXT_PUBLIC_MOCK_MODE === 'true' && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 space-y-3">
                    <div className="text-[10px] font-bold text-violet-400 flex items-center space-x-1.5 uppercase tracking-wider">
                      <span>Mock Link Simulator</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter mock Chat ID"
                        value={mockChatId}
                        onChange={(e) => setMockChatId(e.target.value)}
                        className="flex-grow px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none focus:border-violet-500/30"
                      />
                      <button
                        onClick={handleSimulateTelegramLink}
                        disabled={linkingTg}
                        className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-750 text-[11px] font-bold transition-all shrink-0"
                      >
                        {linkingTg ? 'Linking...' : 'Simulate Link'}
                      </button>
                    </div>
                    {tgSuccess && (
                      <p className="text-[10px] text-emerald-450 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Simulated Telegram link synced!</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Integration Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between">
          <form onSubmit={handleSaveWhatsApp} className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/20 rounded-xl text-emerald-450">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">WhatsApp Integration</h3>
                  <p className="text-[10px] text-slate-500">Receive push notifications on your WhatsApp phone number</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-normal">
                To receive alerts via WhatsApp, enter your phone number with your country code prefix (e.g. <code>628123456789</code> for Indonesia, or <code>15555555555</code> for US). Do not include + or spaces.
              </p>

              <div className="space-y-1.5">
                <label htmlFor="wa-phone" className="text-xs font-semibold text-slate-350">
                  WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  id="wa-phone"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  placeholder="e.g. 628123456789"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              {user?.whatsapp_number ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/10 border border-emerald-900/20 text-emerald-450 text-[11px] flex items-center space-x-2">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Configured Number: <strong>{user.whatsapp_number}</strong></span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 text-[11px] flex items-center space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-slate-500" />
                  <span>No number configured. WhatsApp alerts will fail.</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-900/60 mt-6 space-y-3">
              <button
                type="submit"
                disabled={savingWa}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-550 text-white flex items-center justify-center space-x-2 shadow-lg shadow-emerald-650/15 disabled:opacity-50 cursor-pointer"
              >
                {savingWa ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving configurations...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save WhatsApp Settings</span>
                  </>
                )}
              </button>
              {waSuccess && (
                <p className="text-[10px] text-emerald-450 font-semibold flex items-center justify-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>WhatsApp settings updated successfully!</span>
                </p>
              )}
            </div>
          </form>
        </div>

      </div>

      {/* Integration walkthrough */}
      <div className="glass-card rounded-3xl p-6 border border-slate-900 text-xs text-slate-350 space-y-4">
        <h3 className="font-bold text-white text-sm">Testing notification setups</h3>
        <p className="text-slate-400 leading-relaxed">
          Once you link your Telegram Bot or save your WhatsApp number, we recommend creating a <strong>One-time Reminder</strong> scheduled for <strong>1 minute from now</strong>. Stay on the dashboard page, and you will see the simulated push trigger and deliver logs in real-time, showing how Alert.my.id guarantees alert delivery across your communication platforms!
        </p>
      </div>

    </div>
  )
}
