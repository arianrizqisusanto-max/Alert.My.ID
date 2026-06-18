'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  BellRing, Send, MessageSquare, ArrowRight, Zap, 
  Loader2, Smartphone, Shield, Clock, Globe, Check
} from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactStatus, setContactStatus] = useState('')

  // Simulator state
  const [simChannel, setSimChannel] = useState<'telegram' | 'whatsapp'>('telegram')
  const [simText, setSimText] = useState('Meeting with team in 15 mins 🚀')
  const [isSimulating, setIsSimulating] = useState(false)
  const [messages, setMessages] = useState<Array<{ id: string; text: string; time: string; channel: string }>>([
    { id: '1', text: 'Welcome to Alert.my.id! Your reminders will appear here.', time: '09:00 AM', channel: 'telegram' }
  ])

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
  }

  const triggerSimulation = () => {
    if (isSimulating || !simText.trim()) return
    setIsSimulating(true)

    // Simulate network delay
    setTimeout(() => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: simText,
          time: timeStr,
          channel: simChannel
        }
      ])
      setIsSimulating(false)
    }, 700)
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

  return (
    <div className="min-h-screen flex flex-col bg-[#030408] text-slate-300 bg-grid-pattern relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />

      {/* Main Full-Width Split Layout */}
      <main className="flex-grow flex flex-col md:flex-row w-full border-b border-slate-900/60 z-10">
        
        {/* ─── LEFT PANEL: Hero Info & Interactive Phone Mockup (50% Width on Desktop) ─── */}
        <section className="w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-10 lg:p-16 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/45 backdrop-blur-sm">
          <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
            
            {/* Header Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-650 rounded-lg text-white shadow-md">
                  <BellRing className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">Alert.my.id</span>
              </div>
              <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                30-Day Free Trial
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-300 tracking-tight leading-tight">
                Telegram & WhatsApp Reminders.
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                The developer-grade reminder app. Set tasks in seconds, get notified instantly in your favorite chat. No apps to open. No missed deadlines.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Shield className="h-3.5 w-3.5" />, label: 'Secure Edge' },
                { icon: <Clock className="h-3.5 w-3.5" />, label: 'Zero Latency' },
                { icon: <Globe className="h-3.5 w-3.5" />, label: 'Timezone Safe' }
              ].map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-850 text-slate-350 text-[10px] font-semibold">
                  {tag.icon}
                  <span>{tag.label}</span>
                </span>
              ))}
            </div>

            {/* Phone Mockup Console */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Preview Console</span>
                
                {/* Selector Tabs */}
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                  <button
                    onClick={() => setSimChannel('telegram')}
                    className={`px-3 py-1 text-[9px] font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                      simChannel === 'telegram'
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/10'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Send className="h-2.5 w-2.5" />
                    <span>Telegram</span>
                  </button>
                  <button
                    onClick={() => setSimChannel('whatsapp')}
                    className={`px-3 py-1 text-[9px] font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                      simChannel === 'whatsapp'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <MessageSquare className="h-2.5 w-2.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Phone Container */}
              <div className="w-full bg-[#0a0c16] border border-slate-850 rounded-2xl p-3.5 shadow-2xl relative flex flex-col gap-3">
                
                {/* Header of Chat */}
                <div className={`flex items-center justify-between p-2.5 rounded-xl ${
                  simChannel === 'telegram' ? 'bg-sky-950/20 border border-sky-900/20' : 'bg-emerald-950/20 border border-emerald-900/20'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 relative flex items-center justify-center ${
                      simChannel === 'telegram' ? 'bg-sky-500' : 'bg-emerald-500'
                    }`}>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-inherit opacity-75"></span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-white leading-none">Alert.my.id Bot</p>
                      <p className="text-[8px] text-slate-500 mt-1 leading-none">online</p>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                    {simChannel === 'telegram' ? 'Telegram' : 'WhatsApp'}
                  </span>
                </div>

                {/* Chat Message Area */}
                <div className="h-32 overflow-y-auto p-2.5 bg-[#05060b] border border-slate-900/80 rounded-xl flex flex-col gap-3 scrollbar-thin">
                  {messages.filter(m => m.channel === simChannel).map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-1 items-start max-w-[85%] self-start animate-slide-up">
                      <div className={`p-2.5 rounded-2xl text-xs text-white leading-relaxed ${
                        simChannel === 'telegram'
                          ? 'bg-sky-900/20 border border-sky-900/30 rounded-tl-none'
                          : 'bg-emerald-900/20 border border-emerald-900/30 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-600 pl-1 font-semibold">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    placeholder="Type test reminder..."
                    className="flex-grow text-xs px-3 py-2 bg-[#05060b] border border-slate-900 rounded-xl text-white placeholder-slate-655 focus:outline-none focus:border-slate-800"
                  />
                  <button
                    onClick={triggerSimulation}
                    disabled={isSimulating}
                    className={`px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer text-white ${
                      simChannel === 'telegram'
                        ? 'bg-sky-650 hover:bg-sky-600 shadow-lg shadow-sky-950/35'
                        : 'bg-emerald-650 hover:bg-emerald-600 shadow-lg shadow-emerald-950/35'
                    }`}
                  >
                    {isSimulating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span>Send</span>
                    )}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ─── RIGHT PANEL: Pricing, Steps, Contact & Auth (50% Width on Desktop) ─── */}
        <section className="w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-10 lg:p-16 bg-[#06080e]/40">
          <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
            
            {/* Pricing Section */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing & Channels</h2>
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* Telegram Card */}
                <div className="bg-[#0e111d]/60 border border-slate-900 rounded-xl p-3.5 flex flex-col justify-between h-20 hover:border-violet-500/20 hover:bg-[#111424]/60 transition-all group">
                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <Send className="h-3.5 w-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Telegram Bot</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-bold text-white">$5</span>
                    <span className="text-[9px] text-slate-500">/ year</span>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="bg-[#0e111d]/30 border border-slate-900/40 rounded-xl p-3.5 flex flex-col justify-between h-20 opacity-90 hover:border-emerald-500/20 hover:bg-[#111424]/30 transition-all group">
                  <div className="flex items-center justify-between text-xs text-slate-350">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">WhatsApp</span>
                    </div>
                    <span className="text-[8px] bg-emerald-950/40 text-emerald-500 border border-emerald-900/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Soon</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-bold text-slate-400">$15</span>
                    <span className="text-[9px] text-slate-650">/ year</span>
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-slate-900" />

            {/* Execution Steps (Timeline) */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Steps</h2>
              <div className="flex flex-col gap-3.5 relative pl-2">
                
                {/* Dotted vertical connector line */}
                <div className="absolute left-[13px] top-2.5 bottom-2.5 w-[1px] bg-gradient-to-b from-violet-600/40 via-pink-500/20 to-transparent" />

                {[
                  { step: '1', title: 'Google OAuth Sign In', desc: 'Secure login via Google. Ready in under 15 seconds.' },
                  { step: '2', title: 'Register Bot Link', desc: 'Add our bot to your Telegram Chat ID instantly.' },
                  { step: '3', title: 'Set & Receive Alerts', desc: 'Schedule alerts with automatic timezone conversion.' }
                ].map(item => (
                  <div key={item.step} className="flex gap-4.5 items-start relative z-10">
                    <div className="h-4.5 w-4.5 rounded-full bg-slate-950 border border-violet-500/40 flex items-center justify-center text-[9px] font-bold text-violet-400 shrink-0 shadow-md mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-900" />

            {/* Contact Support */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Support</h2>
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#05060b] border border-slate-900 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-slate-800 transition-colors"
                />
                <textarea
                  required
                  placeholder="Describe your question..."
                  rows={2}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#05060b] border border-slate-900 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-slate-800 transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={contactStatus === 'sending'}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-lg text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {contactStatus === 'sending' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : contactStatus === 'sent' ? (
                    <span className="flex items-center gap-1.5 text-emerald-450"><Check className="h-3.5 w-3.5" /> Ticket Submitted!</span>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </form>
            </div>

            <hr className="border-slate-900" />

            {/* Full-width Google Login button */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCta}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-650 text-white hover:from-violet-550 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Google OAuth Login</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
