'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  Clock, Mail, Send, MessageSquare, 
  ChevronRight, Zap, CheckCircle2 
} from 'lucide-react'

export default function Features() {
  const { login, user } = useAuth()

  const detailedFeatures = [
    {
      icon: <Clock className="h-8 w-8 text-violet-400" />,
      title: 'Flexible Reminder Scheduling',
      description: 'Whether it is a one-time meeting tomorrow or a weekly report summary, configure it easily.',
      points: [
        'One-time alerts: Perfect for individual tasks and deadlines.',
        'Daily recurrences: Great for morning routines or end-of-day updates.',
        'Weekly / Monthly / Yearly: Ideal for rent payments, renewals, and birthdays.'
      ]
    },
    {
      icon: <Mail className="h-8 w-8 text-blue-400" />,
      title: 'Email Delivery via Resend',
      description: 'Reliable, lightning-fast emails delivered directly to your inbox. Optimized to bypass spam folders.',
      points: [
        'Zero setup required. Ready to send on your first login.',
        'Rich HTML styling making reminders readable and scannable.',
        'Includes quick links to dismiss, delay, or edit the reminder.'
      ]
    },
    {
      icon: <Send className="h-8 w-8 text-sky-400" />,
      title: 'Instant Telegram DM Alerts',
      description: 'Connect our official Telegram Bot in under 15 seconds to receive immediate alerts on your desktop or mobile.',
      points: [
        'Secure linkage via custom Telegram deep-linking token.',
        'Zero noise. The bot only sends the alerts you schedule.',
        'Parse formatting supported for clean reminder payloads.'
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-emerald-400" />,
      title: 'WhatsApp Pro Notifications',
      description: 'Get push alerts on the world\'s most popular messaging app. High visibility guarantees you never miss an event.',
      points: [
        'Delivered via Meta\'s official WhatsApp Cloud API.',
        'Clean template formats highlighting Time, Date, and message contents.',
        'Priority queue guarantees delivery even during peak network traffic.'
      ]
    }
  ]

  const handleCta = () => {
    if (user) {
      window.location.href = '/dashboard'
    } else {
      login()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-4 max-w-6xl mx-auto w-full relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Powerfully Simple Features
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed">
            Alert.my.id strips away the complexity of traditional calendar apps and planners. We deliver on a single promise: reminding you on the platforms you use most.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-12">
          {detailedFeatures.map((item, idx) => (
            <div 
              key={idx} 
              className="glass-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start hover:border-slate-800/80 transition-all duration-300"
            >
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl shrink-0">
                {item.icon}
              </div>
              <div className="flex-grow space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                  <span>{item.title}</span>
                  <ChevronRight className="h-5 w-5 text-violet-500 ml-1.5" />
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                  {item.description}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {item.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Extra: Timezone aware section */}
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center mt-16 border-dashed border-violet-950/40 relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-900/40 text-indigo-400 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>Timezone-Aware Delivery</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Detects and adjusts automatically</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              When creating reminders, we auto-detect your browser timezone. Going on a business trip? Schedule using your target destination&apos;s timezone. Our scheduler calculates UTC conversions instantly so reminders alert you exactly when they are due.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={handleCta}
            className="px-8 py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-550 transition-all duration-200 shadow-xl cursor-pointer"
          >
            Create Your First Reminder
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
