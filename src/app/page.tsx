'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  BellRing, Send, MessageSquare, ArrowRight, Zap, 
  Loader2, Smartphone, Shield, Clock, Check, Globe
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
    <div className="min-h-screen flex flex-col bg-[#030408] text-slate-300 bg-grid-pattern relative overflow-hidden">
      
      {/* Aurora Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="ambient-glow" />

      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 py-12 z-10">
        
        {/* Main Console Box (Spacious & Clean Dashboard Container) */}
        <div className="w-full max-w-4xl bg-[#090b11]/85 border border-slate-800/60 rounded-[32px] p-6 md:p-8 shadow-2xl shadow-black/80 grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden">
          
          {/* Subtle glossy card overlay line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

          {/* ─── LEFT COLUMN: Brand, Feature Tags, Phone Mockup ─── */}
          <div className="md:col-span-6 flex flex-col justify-between gap-6">
            
            <div className="flex flex-col gap-4">
              
              {/* Brand Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-indigo-650 rounded-lg text-white shadow-md shadow-violet-950/50">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">Alert.my.id</span>
                </div>
                <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  30-Day Free Trial
                </span>
              </div>

              {/* Headline with High-End Gradient */}
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-indigo-300 tracking-tight leading-tight">
                  Telegram & WhatsApp Reminders.
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  The developer-grade reminder app. Set tasks in seconds, get notified instantly in your favorite chat.
                </p>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[
                  { icon: <Shield className="h-3 w-3" />, label: 'Secure Edge' },
                  { icon: <Clock className="h-3 w-3" />, label: 'Zero Latency' },
                  { icon: <Globe className="h-3 w-3" />, label: 'Timezone Safe' }
                ].map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-900 text-slate-400 text-[10px] font-semibold">
                    {tag.icon}
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>

              {/* INTERACTIVE SMARTPHONE CHAT MOCKUP */}
              <div className="flex flex-col gap-3 mt-2">
                
                {/* Simulator Controls */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Preview Console</span>
                  
                  {/* Selector Tabs */}
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                    <button
                      onClick={() => setSimChannel('telegram')}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
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
                      className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
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

                {/* Smartphone Device Frame */}
                <div className="w-full bg-[#0a0c16] border border-slate-800/80 rounded-2xl p-3 shadow-xl relative flex flex-col gap-2.5">
                  
                  {/* Chat Header Status Bar */}
                  <div className={`flex items-center justify-between p-2 rounded-xl ${
                    simChannel === 'telegram' ? 'bg-sky-950/20 border border-sky-900/15' : 'bg-emerald-950/20 border border-emerald-900/15'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 relative flex items-center justify-center ${
                        simChannel === 'telegram' ? 'bg-sky-500' : 'bg-emerald-500'
                      }`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-inherit opacity-75"></span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-white leading-none">Alert.my.id Bot</p>
                        <p className="text-[8px] text-slate-500 mt-0.5 leading-none">online</p>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                      {simChannel === 'telegram' ? 'Telegram' : 'WhatsApp'}
                    </span>
                  </div>

                  {/* Chat Body (Message Container) */}
                  <div className="h-28 overflow-y-auto p-2 bg-[#05060b] border border-slate-900/60 rounded-xl flex flex-col gap-2.5 scrollbar-thin">
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

                  {/* Message Input Simulator */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simText}
                      onChange={(e) => setSimText(e.target.value)}
                      placeholder="Type test reminder..."
                      className="flex-grow text-xs px-3 py-2 bg-[#05060b] border border-slate-900 rounded-xl text-white placeholder-slate-650 focus:outline-none focus:border-slate-800"
                    />
                    <button
                      onClick={triggerSimulation}
                      disabled={isSimulating}
                      className={`px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer text-white shadow-md ${
                        simChannel === 'telegram'
                          ? 'bg-sky-650 hover:bg-sky-600 shadow-sky-950/40'
                          : 'bg-emerald-650 hover:bg-emerald-600 shadow-emerald-950/40'
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

          </div>

          {/* ─── RIGHT COLUMN: Pricing, Timeline, Contact Form ─── */}
          <div className="md:col-span-6 flex flex-col gap-6 md:border-l md:border-slate-900/80 md:pl-8">
            
            {/* Pricing Grid */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Channels & Cost</h2>
              <div className="grid grid-cols-2 gap-3">
                
                {/* Telegram Card */}
                <div className="bg-[#0e111d]/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between h-20 hover:border-violet-500/20 hover:bg-[#111424]/60 transition-all group">
                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <Send className="h-3.5 w-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Telegram</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-bold text-white">$5</span>
                    <span className="text-[9px] text-slate-500">/ year</span>
                  </div>
                </div>

                {/* WhatsApp Card */}
                <div className="bg-[#0e111d]/30 border border-slate-900/40 rounded-xl p-3 flex flex-col justify-between h-20 opacity-90 hover:border-emerald-500/20 hover:bg-[#111424]/30 transition-all group">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">WhatsApp</span>
                    </div>
                    <span className="text-[8px] bg-emerald-950/40 text-emerald-500 border border-emerald-900/20 px-1 rounded uppercase tracking-wider font-bold">Soon</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-bold text-slate-350">$15</span>
                    <span className="text-[9px] text-slate-650">/ year</span>
                  </div>
                </div>

              </div>
            </div>

            <hr className="border-slate-900" />

            {/* How It Works Timeline */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Steps</h2>
              <div className="flex flex-col gap-3 relative pl-2">
                
                {/* Vertical timeline connector line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-violet-600/40 via-pink-500/20 to-transparent" />

                {[
                  { step: '1', title: 'OAuth Sign In', desc: 'Authenticate via Google. Instantly provisions your trial.' },
                  { step: '2', title: 'Register Bot', desc: 'Link our bot to your Telegram Chat ID in one click.' },
                  { step: '3', title: 'Automated Dispatch', desc: 'Schedule alerts with local timezone computation.' }
                ].map(item => (
                  <div key={item.step} className="flex gap-4.5 items-start relative z-10">
                    <div className="h-4.5 w-4.5 rounded-full bg-slate-950 border border-violet-500/40 flex items-center justify-center text-[9px] font-bold text-violet-400 shrink-0 shadow-md shadow-violet-950/20 mt-0.5">
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

            {/* Support Widget */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Support Ticket</h2>
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
                  placeholder="Describe your issue..."
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

            {/* Direct Google Access Button */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCta}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-650 text-white hover:from-violet-550 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/20"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Google OAuth Login</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
