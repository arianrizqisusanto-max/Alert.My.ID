'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  BellRing, Send, MessageSquare, ArrowRight, Zap, 
  Loader2, Smartphone, CheckCircle, RefreshCw
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
  const [showNotification, setShowNotification] = useState(false)

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
  }

  const triggerSimulation = () => {
    if (isSimulating) return
    setIsSimulating(true)
    setShowNotification(true)

    // Reset simulator after animation completes (5s matches CSS keyframe duration)
    setTimeout(() => {
      setShowNotification(false)
      setIsSimulating(false)
    }, 5000)
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
      
      {/* Soft Ambient top glow */}
      <div className="ambient-glow" />

      {/* Mock iOS/Android Notification Banner */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-none animate-notification">
          <div className="bg-[#101323]/95 border border-white/10 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl flex gap-3 text-left">
            <div className="shrink-0 flex items-center justify-center">
              {simChannel === 'telegram' ? (
                <div className="h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Send className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">
                  {simChannel === 'telegram' ? 'Telegram Alert' : 'WhatsApp Alert'}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">now</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">Alert.my.id Bot</p>
              <p className="text-xs text-slate-350 mt-0.5 truncate">{simText}</p>
            </div>
          </div>
        </div>
      )}

      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 py-8 z-10">
        
        {/* Main Console Box */}
        <div className="w-full max-w-md bg-slate-950/80 border border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 glow-border-hover">
          
          {/* Header Title & Branding */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="p-1.5 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-lg text-white">
                  <BellRing className="h-4 w-4" />
                </span>
                <span>Alert.my.id</span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated Telegram & WhatsApp Reminders.
              </p>
            </div>
            <span className="text-[9px] bg-violet-950/45 text-violet-400 border border-violet-900/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              30-Day Trial
            </span>
          </div>

          <hr className="border-slate-900" />

          {/* Pricing Grid */}
          <div className="flex flex-col gap-2.5">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing Plan</h2>
            <div className="grid grid-cols-2 gap-2">
              
              {/* Telegram Card */}
              <div className="bg-slate-900/50 border border-slate-900/80 rounded-xl p-3 flex flex-col justify-between h-20 hover:border-violet-500/20 transition-all">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Send className="h-3.5 w-3.5 text-sky-400" />
                  <span className="font-semibold">Telegram</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl font-bold text-white">$5</span>
                  <span className="text-[9px] text-slate-500">/ year</span>
                </div>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-slate-900/30 border border-slate-900/40 rounded-xl p-3 flex flex-col justify-between h-20 opacity-85 hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-semibold">WhatsApp</span>
                  </div>
                  <span className="text-[8px] bg-emerald-950/50 text-emerald-500 border border-emerald-900/30 px-1 rounded uppercase tracking-wider font-bold">Soon</span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl font-bold text-slate-350">$15</span>
                  <span className="text-[9px] text-slate-600">/ year</span>
                </div>
              </div>

            </div>
          </div>

          <hr className="border-slate-900" />

          {/* INTERACTIVE ALERTS SIMULATOR */}
          <div className="flex flex-col gap-3 bg-slate-900/40 border border-slate-900 p-3.5 rounded-2xl">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
              <span>Alerts Simulator</span>
              <span className="text-slate-400 font-medium">Click to test live</span>
            </h3>

            {/* Selector Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
              <button
                onClick={() => setSimChannel('telegram')}
                className={`py-1.5 text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  simChannel === 'telegram'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Send className="h-3 w-3" />
                <span>Telegram</span>
              </button>
              <button
                onClick={() => setSimChannel('whatsapp')}
                className={`py-1.5 text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  simChannel === 'whatsapp'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <MessageSquare className="h-3 w-3" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Input Simulator */}
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="Alert text..."
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-900 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-slate-800"
              />
              <button
                onClick={triggerSimulation}
                disabled={isSimulating}
                className="w-full py-2 bg-violet-650 hover:bg-violet-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-violet-950/40"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Sending Notification...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Simulate Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* Main CTA */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCta}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-950/20"
            >
              <Zap className="h-4 w-4" />
              <span>Get Started (Google Login)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[9px] text-slate-600 text-center">
              Instant setup · No credentials or credit cards needed
            </p>
          </div>

          <hr className="border-slate-900" />

          {/* Timeline - How It Works */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">How It Works</h2>
            <div className="flex flex-col gap-3">
              {[
                { step: '1', title: 'Sign In', desc: 'Sign in with Google. Your trial starts immediately.' },
                { step: '2', title: 'Connect Bot', desc: 'Add our bot to your Telegram with one click.' },
                { step: '3', title: 'Set Alerts', desc: 'Schedule alerts with local timezone support.' }
              ].map(item => (
                <div key={item.step} className="flex gap-3 items-start">
                  <div className="h-5 w-5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[10px] font-bold text-violet-400 shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{item.desc}</p>
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
                className="w-full text-xs px-3 py-2 bg-slate-900/60 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-800 transition-colors"
              />
              <textarea
                required
                placeholder="Message"
                rows={2}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-900/60 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-800 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={contactStatus === 'sending'}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded-lg text-xs font-bold text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {contactStatus === 'sending' ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : contactStatus === 'sent' ? (
                  <span>Message Sent!</span>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
