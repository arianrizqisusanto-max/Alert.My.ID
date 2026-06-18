'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  Send, MessageSquare, ArrowRight, Zap, 
  Loader2, Check, Shield, Clock, Globe
} from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactStatus, setContactStatus] = useState('')
  const [simChannel, setSimChannel] = useState<'telegram' | 'whatsapp'>('telegram')
  const [simText, setSimText] = useState('Team meeting in 15 mins 🚀')
  const [isSimulating, setIsSimulating] = useState(false)
  const [messages, setMessages] = useState<Array<{ id: string; text: string; time: string; channel: string }>>([
    { id: '1', text: 'Your reminder is set! Alert.my.id will notify you on time.', time: '09:00', channel: 'telegram' },
    { id: '2', text: 'Your reminder is set! Alert.my.id will notify you on time.', time: '09:00', channel: 'whatsapp' },
  ])

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
  }

  const triggerSimulation = () => {
    if (isSimulating || !simText.trim()) return
    setIsSimulating(true)
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [...prev, { id: Date.now().toString(), text: simText, time: timeStr, channel: simChannel }])
      setIsSimulating(false)
    }, 600)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactEmail || !contactMessage) return
    setContactStatus('sending')
    setTimeout(() => {
      setContactStatus('sent')
      setContactEmail('')
      setContactMessage('')
    }, 800)
  }

  const isTelegram = simChannel === 'telegram'

  return (
    <div className="min-h-screen flex flex-col bg-[#040508] text-slate-300 relative overflow-hidden">
      
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/6 blur-[100px] rounded-full" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row w-full z-10">

        {/* ── LEFT: Hero + Chat Simulator ── */}
        <section className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-14 lg:py-12 lg:border-r border-slate-900/70">
          <div className="max-w-lg w-full mx-auto flex flex-col gap-7">

            {/* Headline */}
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/15 px-2.5 py-1 rounded-full w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                30-Day Free Trial
              </span>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Reminders via{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">Telegram</span>
                {' '}& WhatsApp
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Never miss a deadline. Get instant alerts to your chat app — automatic, timezone-aware, and serverless.
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { icon: <Shield className="h-3 w-3" />, label: 'Secure OAuth' },
                  { icon: <Clock className="h-3 w-3" />, label: 'Timezone Aware' },
                  { icon: <Globe className="h-3 w-3" />, label: 'Serverless Edge' },
                ].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400">
                    {t.icon}{t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat Simulator */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Live Preview</span>
                <div className="flex bg-slate-950 border border-slate-900 rounded-lg p-0.5 gap-0.5">
                  {(['telegram', 'whatsapp'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setSimChannel(ch)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                        simChannel === ch
                          ? ch === 'telegram'
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/15'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/15'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {ch === 'telegram' ? <Send className="h-2 w-2" /> : <MessageSquare className="h-2 w-2" />}
                      {ch === 'telegram' ? 'Telegram' : 'WhatsApp'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`bg-[#090b14] border rounded-xl p-3 flex flex-col gap-2 ${isTelegram ? 'border-sky-900/25' : 'border-emerald-900/25'}`}>
                {/* Chat header */}
                <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${isTelegram ? 'bg-sky-950/20' : 'bg-emerald-950/20'}`}>
                  <span className={`h-2 w-2 rounded-full relative ${isTelegram ? 'bg-sky-400' : 'bg-emerald-400'}`}>
                    <span className="animate-ping absolute inset-0 rounded-full bg-inherit opacity-60" />
                  </span>
                  <span className="text-[10px] font-bold text-white">Alert.my.id Bot</span>
                  <span className="text-[8px] text-slate-500 ml-auto">{isTelegram ? 'Telegram' : 'WhatsApp'}</span>
                </div>

                {/* Messages */}
                <div className="h-28 overflow-y-auto flex flex-col gap-2 px-1">
                  {messages.filter(m => m.channel === simChannel).map(msg => (
                    <div key={msg.id} className="flex flex-col gap-0.5 max-w-[80%]">
                      <div className={`px-3 py-2 rounded-xl rounded-tl-sm text-[11px] text-white leading-relaxed ${
                        isTelegram ? 'bg-sky-900/25 border border-sky-900/30' : 'bg-emerald-900/25 border border-emerald-900/30'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-600 pl-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simText}
                    onChange={e => setSimText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && triggerSimulation()}
                    placeholder="Type a reminder..."
                    className="flex-1 text-xs px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
                  />
                  <button
                    onClick={triggerSimulation}
                    disabled={isSimulating}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer ${
                      isTelegram ? 'bg-sky-600 hover:bg-sky-500' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Send'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── RIGHT: Pricing + Steps + CTA ── */}
        <section className="flex-1 lg:max-w-sm xl:max-w-md flex flex-col justify-center px-8 py-10 lg:px-10 lg:py-12 bg-slate-950/30">
          <div className="flex flex-col gap-5">

            {/* Pricing */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Plans</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 hover:border-sky-500/30 transition-colors group">
                  <div className="flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-sky-400" />
                    <span className="text-xs font-semibold text-white">Telegram</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">$5</span>
                    <span className="text-[9px] text-slate-500">/year</span>
                  </div>
                </div>
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3.5 flex flex-col gap-3 opacity-70">
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-300">WhatsApp</span>
                    </div>
                    <span className="text-[8px] bg-emerald-950/60 text-emerald-500 border border-emerald-900/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Soon</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-400">$15</span>
                    <span className="text-[9px] text-slate-600">/year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-900" />

            {/* Steps */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">How It Works</span>
              <div className="flex flex-col gap-2.5">
                {[
                  { n: '1', title: 'Sign in with Google', desc: 'One click OAuth — no passwords.' },
                  { n: '2', title: 'Link Telegram Bot', desc: 'Copy your Chat ID in 10 seconds.' },
                  { n: '3', title: 'Set Reminders', desc: 'Pick time, we handle timezone.' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-[9px] font-bold text-violet-400 shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{s.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-900" />

            {/* CTA */}
            <button
              onClick={handleCta}
              className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-950/40"
            >
              <Zap className="h-4 w-4" />
              <span>{user ? 'Go to Dashboard' : 'Start Free Trial'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-[10px] text-slate-600">No credit card · 30-day free trial</p>

            <div className="h-px bg-slate-900" />

            {/* Contact */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Contact Support</span>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
                <textarea
                  required
                  placeholder="Your question..."
                  rows={2}
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none"
                />
                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {contactStatus === 'sending' ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /><span>Sending...</span></>
                  ) : contactStatus === 'sent' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400"><Check className="h-3.5 w-3.5" /> Sent!</span>
                  ) : 'Send Message'}
                </button>
              </form>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
