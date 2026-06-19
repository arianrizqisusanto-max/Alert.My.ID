'use client'

import React, { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import {
  Send, MessageSquare, ArrowRight, Zap,
  Loader2, Check, Calendar, Clock, Repeat,
  BellRing, Star, ChevronRight, Globe, Shield,
  Users, Briefcase, Heart, Coffee
} from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [simText, setSimText] = useState('Board meeting at 3pm — prepare slides')
  const [isSimulating, setIsSimulating] = useState(false)
  const [messages, setMessages] = useState<{ id: string; text: string; time: string }[]>([
    { id: '1', text: '🔔 Doctor appointment tomorrow at 10:00 AM. Don\'t forget!', time: '08:30' },
    { id: '2', text: '🔔 Quarterly report due in 2 hours. Time to wrap up!', time: '10:00' },
  ])
  const msgBoxRef = useRef<HTMLDivElement>(null)

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
  }

  const triggerSimulation = () => {
    if (isSimulating || !simText.trim()) return
    setIsSimulating(true)
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `🔔 ${simText}`, time: timeStr }])
      setIsSimulating(false)
    }, 500)
  }

  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight
    }
  }, [messages])

  const useCases = [
    { icon: <Briefcase className="h-5 w-5" />, who: 'Executive', use: 'Never miss a board meeting or deadline' },
    { icon: <Users className="h-5 w-5" />, who: 'Secretary', use: 'Remind your boss of every appointment' },
    { icon: <Heart className="h-5 w-5" />, who: 'Parents', use: 'School pickups, doctor visits, birthdays' },
    { icon: <Coffee className="h-5 w-5" />, who: 'Freelancer', use: 'Client calls, invoice due dates, project milestones' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#030408] text-slate-300 relative">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-violet-700/8 blur-[180px] rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-sky-600/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-indigo-600/6 blur-[160px] rounded-full" />
      </div>

      <Navbar />

      {/* ─────────────────── HERO SECTION ─────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-5 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          30-Day Free Trial · No Credit Card Required
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-4xl mb-4">
          Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-sky-400">
            Personal Alert System
          </span>
          {' '}—{' '}Always On Time
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-3">
          From a secretary reminding her boss, to a parent remembering school pickup —
          <span className="text-white font-semibold"> Alert.my.id</span> delivers smart reminders
          straight to your <span className="text-sky-400 font-semibold">Telegram</span>, automatically.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-violet-400" /> Secure Google Login</span>
          <span className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-violet-400" /> Timezone Aware</span>
          <span className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5 text-violet-400" /> Recurring Reminders</span>
          <span className="text-slate-700">·</span>
          <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-violet-400" /> Serverless & Always Up</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleCta}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-base transition-all shadow-xl shadow-violet-950/50 hover:shadow-violet-950/70 active:scale-[0.98] cursor-pointer"
          >
            <Zap className="h-4.5 w-4.5" />
            {user ? 'Go to Dashboard' : 'Start Free Trial'}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleCta}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-white font-bold text-base transition-all cursor-pointer"
          >
            See How It Works
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─────────────────── GOOGLE CALENDAR SECTION (BLOWN UP) ─────────────────── */}
      <section className="relative z-10 px-5 py-8 sm:py-10">
        <div className="max-w-6xl mx-auto">

          {/* Section label */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Calendar className="h-3.5 w-3.5" />
              Star Feature
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left: copy */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
                Your Calendar,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                  Your Reminders
                </span>
                <br />— Automatically.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-5">
                Connect your <strong className="text-white">Google Calendar</strong> once and every event becomes a Telegram alert.
                No manual setup. No missed meetings. Just instant, automatic notifications at the right time.
              </p>

              <div className="flex flex-col gap-2.5 mb-5">
                {[
                  { icon: <Calendar className="h-5 w-5 text-emerald-400" />, title: 'Sync Any Calendar Event', desc: 'Meetings, birthdays, deadlines — all pulled from Google Calendar automatically.' },
                  { icon: <Clock className="h-5 w-5 text-sky-400" />, title: 'Custom Alert Timing', desc: '5 mins before, 1 hour before, or exactly on time — your choice.' },
                  { icon: <Repeat className="h-5 w-5 text-violet-400" />, title: 'Recurring Events Handled', desc: 'Weekly standups, monthly reviews — recurrences automatically tracked.' },
                  { icon: <Globe className="h-5 w-5 text-pink-400" />, title: 'Timezone Intelligent', desc: 'Works across timezones. Your team in Tokyo gets the right alert at the right time.' },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 items-start p-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-slate-700/60 transition-all group">
                    <div className="mt-0.5 p-2 bg-slate-800/80 rounded-xl group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm mb-1">{f.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleCta} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-950/40">
                <Calendar className="h-4 w-4" />
                Connect Google Calendar
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right: Google Calendar visual mockup */}
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-3xl" />

              <div className="relative bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Google Calendar</p>
                      <p className="text-slate-500 text-xs">June 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-bold">Synced</span>
                  </div>
                </div>

                {/* Calendar events */}
                <div className="flex flex-col gap-2.5">
                  {[
                    { time: '09:00', title: 'Board Meeting', tag: 'Work', color: 'bg-blue-500', sent: true },
                    { time: '11:30', title: 'Dentist Appointment', tag: 'Personal', color: 'bg-pink-500', sent: true },
                    { time: '14:00', title: 'Q3 Budget Review', tag: 'Finance', color: 'bg-violet-500', sent: false },
                    { time: '17:00', title: 'Team Standup', tag: 'Work', color: 'bg-sky-500', sent: false },
                  ].map((ev, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ev.sent ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-slate-900/50 border-slate-800/50'}`}>
                      <div className={`h-2.5 w-2.5 rounded-full ${ev.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs truncate">{ev.title}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{ev.time} · {ev.tag}</p>
                      </div>
                      {ev.sent ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <BellRing className="h-3 w-3" />
                          <span className="text-[10px] font-bold">Sent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px]">Pending</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Arrow + Telegram card */}
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 justify-center text-slate-600 text-xs font-semibold">
                    <div className="h-px flex-1 bg-slate-800" />
                    Alert triggered to
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2.5 p-3 bg-sky-950/30 border border-sky-900/30 rounded-xl">
                      <Send className="h-4 w-4 text-sky-400 shrink-0" />
                      <div>
                        <p className="text-sky-300 font-bold text-xs">Telegram</p>
                        <p className="text-slate-500 text-[10px]">Instant delivery</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2.5 p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl opacity-50">
                      <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-slate-400 font-bold text-xs">WhatsApp</p>
                        <p className="text-emerald-600 text-[10px] font-bold">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── USE CASES ─────────────────── */}
      <section className="relative z-10 px-5 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Who Uses Alert.my.id</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Powerful Reminders for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Everyone</span>
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Whether you're managing a team or your family schedule — we keep you ahead.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((u, i) => (
              <div key={i} className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-violet-500/30 hover:bg-slate-900/60 transition-all group cursor-default">
                <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                  {u.icon}
                </div>
                <p className="text-white font-bold text-sm mb-1.5">{u.who}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{u.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── LIVE SIMULATOR ─────────────────── */}
      <section className="relative z-10 px-5 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: copy */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Try It Now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                See It in Action —{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">Live</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                Type any reminder below and see exactly how your Telegram message will look. Instant, clean, and straight to the point.
              </p>

              <div className="flex flex-col gap-3">
                {[
                  { n: '1', t: 'Sign in with Google', d: 'Secure passwordless login in 10 seconds.' },
                  { n: '2', t: 'Connect Telegram Bot', d: 'Hit /start in our bot — linked instantly.' },
                  { n: '3', t: 'Sync & Set Reminders', d: 'Google Calendar or manual — your choice.' },
                  { n: '4', t: 'Receive Alerts On Time', d: 'Telegram message at exactly the right moment.' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-4">
                    <div className="h-7 w-7 rounded-full bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-xs font-black text-violet-400 shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{s.t}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: live chat simulator */}
            <div className="bg-slate-950/80 border border-sky-900/25 rounded-3xl p-5 shadow-2xl shadow-sky-950/20">
              {/* Header */}
              <div className="flex items-center gap-2.5 p-3 bg-sky-950/25 rounded-2xl mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
                  <BellRing className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Alert.my.id Bot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-emerald-400 font-medium">Online via Telegram</span>
                  </div>
                </div>
                <Send className="h-4 w-4 text-sky-400" />
              </div>

              {/* Messages */}
              <div ref={msgBoxRef} className="h-52 overflow-y-auto flex flex-col gap-2.5 mb-4 pr-1">
                {messages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-1 max-w-[88%] animate-fade-in">
                    <div className="px-4 py-2.5 bg-sky-950/30 border border-sky-900/30 rounded-2xl rounded-tl-sm text-sm text-white leading-relaxed">
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-600 pl-2">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={simText}
                  onChange={e => setSimText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && triggerSimulation()}
                  placeholder="Type your reminder..."
                  className="flex-1 text-sm px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-800 transition-colors"
                />
                <button
                  onClick={triggerSimulation}
                  disabled={isSimulating}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Send</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── CHANNELS ─────────────────── */}
      <section className="relative z-10 px-5 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notification Channels</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Where Your Alerts Land
          </h2>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">

            {/* Telegram — LIVE */}
            <div className="relative p-6 bg-sky-950/20 border border-sky-700/30 rounded-3xl text-left hover:border-sky-600/50 transition-all shadow-lg shadow-sky-950/10">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 bg-sky-500/15 border border-sky-500/25 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-wide">Live</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="text-white font-black text-lg mb-2">Telegram</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Connect your Telegram account and receive alerts instantly. Works on all devices — phone, tablet, desktop.
              </p>
              <ul className="flex flex-col gap-2">
                {['Free to use', 'Instant delivery', 'Rich message format', 'Multi-bot architecture'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp — Coming Soon */}
            <div className="relative p-6 bg-slate-900/30 border border-slate-800/40 rounded-3xl text-left opacity-70 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 bg-emerald-950/60 border border-emerald-900/30 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-wide">Coming Soon</span>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-black text-lg mb-2">WhatsApp</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                WhatsApp integration is on the way. Get reminders delivered directly to your WhatsApp — where everyone already is.
              </p>
              <ul className="flex flex-col gap-2">
                {['No extra app needed', 'Business API powered', 'Group notifications', 'Template messages'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────── PRICING ─────────────────── */}
      <section className="relative z-10 px-5 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Simple, Honest Pricing</h2>
          <p className="text-slate-400 mb-6">Start free, upgrade when you love it.</p>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">

            {/* Telegram Plan */}
            <div className="relative p-6 bg-gradient-to-b from-violet-950/40 to-slate-950/40 border border-violet-700/30 rounded-3xl text-left hover:border-violet-600/50 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-sky-400" />
                <span className="text-white font-bold text-sm">Telegram Plan</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-5xl font-black text-white">$5</span>
                <span className="text-slate-500 text-sm font-bold">/ year</span>
              </div>
              <p className="text-slate-500 text-xs mb-5">≈ $0.42/month · Billed annually</p>
              <ul className="flex flex-col gap-2.5 mb-6">
                {['Unlimited reminders', 'Google Calendar sync', 'Recurring alerts', 'All timezones', '30-day free trial'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleCta} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* WhatsApp Plan */}
            <div className="relative p-6 bg-slate-900/30 border border-slate-800/40 rounded-3xl text-left opacity-60 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 bg-emerald-950/60 border border-emerald-900/30 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-wide">Coming Soon</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <span className="text-slate-300 font-bold text-sm">WhatsApp Pro</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-5xl font-black text-slate-500">$15</span>
                <span className="text-slate-600 text-sm font-bold">/ year</span>
              </div>
              <p className="text-slate-600 text-xs mb-5">Telegram + WhatsApp included</p>
              <ul className="flex flex-col gap-2.5 mb-6">
                {['Everything in Telegram', 'WhatsApp notifications', 'Priority support', 'Early access features', 'Multi-channel alerts'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="w-full py-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-slate-500 font-bold text-sm text-center">
                Notify Me When Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── FINAL CTA ─────────────────── */}
      <section className="relative z-10 px-5 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-6 sm:p-8 bg-gradient-to-b from-violet-950/30 to-slate-950/60 border border-violet-700/20 rounded-3xl overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/15 blur-3xl" />

            <div className="relative">
              <div className="flex justify-center mb-5">
                <div className="p-3 bg-gradient-to-br from-violet-600 to-pink-600 rounded-2xl shadow-xl shadow-violet-950/40">
                  <BellRing className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Never Miss Another Thing
              </h2>
              <p className="text-slate-400 text-lg mb-5 max-w-xl mx-auto">
                Your personal alert system, running 24/7 — on Cloudflare's global network.
                Set it once. Let it work forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCta}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-base transition-all shadow-xl shadow-violet-950/50 cursor-pointer"
                >
                  <Star className="h-4.5 w-4.5" />
                  {user ? 'Go to Dashboard' : 'Start Free — 30 Days'}
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>
              <p className="text-slate-600 text-xs mt-4">No credit card · No contracts · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
