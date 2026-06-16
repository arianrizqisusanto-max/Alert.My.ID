'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { BellRing, Send, MessageSquare, ArrowRight, Zap, Loader2 } from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactStatus, setContactStatus] = useState('')

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
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
    <div className="min-h-screen flex flex-col bg-[#07080f] text-slate-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 py-8">
        {/* Centered Ultra-Minimal Box */}
        <div className="w-full max-w-md bg-slate-950/80 border border-slate-900 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
          
          {/* Header Description */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="p-1.5 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-lg text-white">
                <BellRing className="h-4 w-4" />
              </span>
              <span>Alert.my.id</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Telegram & WhatsApp Reminders. Stay Alert. Stay Ahead.
            </p>
          </div>

          <hr className="border-slate-900" />

          {/* Pricing & Channels */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Channels & Pricing</h2>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                <div className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5 text-sky-400" />
                  <span className="font-semibold text-slate-200">Telegram Bot Alerts</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-white">
                  <span>$5</span>
                  <span className="text-[9px] text-slate-500 font-normal">/ year</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-900/40 p-2.5 rounded-xl border border-slate-900/50 opacity-85">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>WhatsApp Alerts</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-500 border border-emerald-900/50 font-bold uppercase tracking-wider">Soon</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-slate-400">
                  <span>$15</span>
                  <span className="text-[9px] text-slate-600 font-normal">/ year</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCta}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Start 30-Day Free Trial</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <p className="text-[9px] text-slate-500 text-center">
              One-click Google Login · No credit card required
            </p>
          </div>

          <hr className="border-slate-900" />

          {/* Features List (Compact) */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">How it works</h2>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
              <li>Auto-detects timezone from browser metadata.</li>
              <li>Link our Telegram bot to receive scheduled messages.</li>
              <li>Configure messages & recurring patterns (daily, weekly, monthly, yearly).</li>
            </ul>
          </div>

          <hr className="border-slate-900" />

          {/* FAQ (Very Simple) */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FAQ</h2>
            <div className="flex flex-col gap-2 text-xs">
              <div>
                <p className="font-bold text-slate-200">Is it secure?</p>
                <p className="text-slate-400 mt-0.5">Yes, all reminder data is private and encrypted.</p>
              </div>
              <div>
                <p className="font-bold text-slate-200">How do I cancel?</p>
                <p className="text-slate-400 mt-0.5">Cancel auto-renewal anytime in the dashboard with a single click.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* Contact (Ultra Compact) */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Support</h2>
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                required
                placeholder="Email address"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-800 transition-colors"
              />
              <textarea
                required
                placeholder="Your message"
                rows={2}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-800 transition-colors resize-none"
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
