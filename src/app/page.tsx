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
    <div className="min-h-screen flex flex-col bg-[#040508] text-slate-300 relative">
      
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 blur-[120px] rounded-full" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row w-full z-10">

        {/* ── LEFT: Hero + Chat Simulator ── */}
        <section className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-12 lg:px-16 lg:py-10 lg:border-r border-slate-900/70">
          <div className="max-w-2xl w-full mx-auto flex flex-col gap-8">

            {/* Headline */}
            <div className="flex flex-col gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/15 px-3 py-1 rounded-full w-fit">
                <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                30-Day Free Trial
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Reminders via{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">Telegram</span>
                {' '}& WhatsApp
              </h1>
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                Never miss a deadline. Get instant alerts straight to your favorite chat apps — completely automatic, timezone-aware, and built on serverless edge.
              </p>
              <div className="flex flex-wrap gap-2.5 mt-2">
                {[
                  { icon: <Shield className="h-3.5 w-3.5" />, label: 'Secure OAuth' },
                  { icon: <Clock className="h-3.5 w-3.5" />, label: 'Timezone Aware' },
                  { icon: <Globe className="h-3.5 w-3.5" />, label: 'Serverless Edge' },
                ].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
                    {t.icon}{t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat Simulator */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Preview Simulator</span>
                <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 gap-1">
                  {(['telegram', 'whatsapp'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setSimChannel(ch)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simChannel === ch
                          ? ch === 'telegram'
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/15'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/15'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {ch === 'telegram' ? <Send className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                      {ch === 'telegram' ? 'Telegram' : 'WhatsApp'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`bg-[#08090f] border rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 ${isTelegram ? 'border-sky-900/30' : 'border-emerald-900/30'}`}>
                {/* Chat header */}
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${isTelegram ? 'bg-sky-950/20' : 'bg-emerald-950/20'}`}>
                  <span className={`h-2.5 w-2.5 rounded-full relative ${isTelegram ? 'bg-sky-400' : 'bg-emerald-400'}`}>
                    <span className="animate-ping absolute inset-0 rounded-full bg-inherit opacity-60" />
                  </span>
                  <span className="text-xs font-extrabold text-white">Alert.my.id Bot</span>
                  <span className="text-[10px] text-slate-500 ml-auto font-medium">{isTelegram ? 'Telegram' : 'WhatsApp'}</span>
                </div>

                {/* Messages */}
                <div className="h-44 sm:h-52 overflow-y-auto flex flex-col gap-2.5 px-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {messages.filter(m => m.channel === simChannel).map(msg => (
                    <div key={msg.id} className="flex flex-col gap-1 max-w-[85%] animate-slide-up">
                      <div className={`px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs sm:text-sm text-white leading-relaxed ${
                        isTelegram ? 'bg-sky-900/20 border border-sky-900/25' : 'bg-emerald-900/20 border border-emerald-900/25'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 pl-1.5">{msg.time}</span>
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
                    placeholder="Type a custom reminder and hit send..."
                    className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-655 focus:outline-none focus:border-slate-700"
                  />
                  <button
                    onClick={triggerSimulation}
                    disabled={isSimulating}
                    className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer ${
                      isTelegram ? 'bg-sky-600 hover:bg-sky-500' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── RIGHT: Pricing + Steps + CTA ── */}
        <section className="flex-1 lg:max-w-xl xl:max-w-2xl flex flex-col justify-center px-6 py-8 sm:px-12 lg:px-16 lg:py-10 bg-[#06070a]/40">
          <div className="max-w-xl w-full mx-auto flex flex-col gap-6 sm:gap-8">

            {/* Pricing */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Plans</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4.5 flex flex-col gap-4 hover:border-violet-500/30 transition-all group cursor-default">
                  <div className="flex items-center gap-2">
                    <Send className="h-4.5 w-4.5 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white">Telegram Channel</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">$5</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">/ year</span>
                  </div>
                </div>
                <div className="bg-slate-900/30 border border-slate-800/40 rounded-2xl p-4.5 flex flex-col gap-4 opacity-75 cursor-not-allowed">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-emerald-400" />
                      <span className="text-sm font-bold text-slate-300">WhatsApp</span>
                    </div>
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-500 border border-emerald-900/30 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wide">Soon</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-500">$15</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">/ year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-900/80" />

            {/* Steps */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">How It Works</span>
              <div className="flex flex-col gap-3.5 pl-1">
                {[
                  { n: '1', title: 'Sign in with Google', desc: 'Secure passwordless login using your Google account. Ready instantly.' },
                  { n: '2', title: 'Link Telegram Bot', desc: 'Add our bot to your Telegram and type /start to get your Chat ID.' },
                  { n: '3', title: 'Set Reminders', desc: 'Pick your preferred date/time; we translate and schedule alerts perfectly.' },
                ].map(s => (
                  <div key={s.n} className="flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-900/80" />

            {/* CTA */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleCta}
                className="w-full py-4 rounded-2xl text-base font-extrabold bg-gradient-to-r from-violet-600 to-indigo-650 text-white hover:from-violet-550 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60 active:scale-[0.99]"
              >
                <Zap className="h-4.5 w-4.5 animate-pulse" />
                <span>{user ? 'Go to Dashboard' : 'Start Your Free Trial'}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <p className="text-center text-xs text-slate-500 font-medium">No credit card required · 30-day fully featured trial</p>
            </div>

            <div className="h-px bg-slate-900/80" />

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Support</span>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-slate-700"
                />
                <textarea
                  required
                  placeholder="How can we help you?"
                  rows={2}
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 resize-none"
                />
                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {contactStatus === 'sending' ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Sending ticket...</span></>
                  ) : contactStatus === 'sent' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400"><Check className="h-4 w-4" /> Message Sent Successfully!</span>
                  ) : 'Submit Support Ticket'}
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
