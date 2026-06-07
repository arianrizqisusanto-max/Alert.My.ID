'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  Clock, Send, MessageSquare, 
  ChevronRight, Zap, CheckCircle2, Globe, Shield
} from 'lucide-react'

export default function Features() {
  const { login, user } = useAuth()

  const detailedFeatures = [
    {
      icon: <Clock className="h-8 w-8 text-violet-400" />,
      title: 'Flexible Reminder Scheduling',
      description: 'Whether it is a one-time meeting tomorrow or a weekly report summary, configure it easily from your dashboard.',
      points: [
        'One-time alerts: Perfect for individual tasks and deadlines.',
        'Daily recurrences: Great for morning routines or end-of-day updates.',
        'Weekly / Monthly / Yearly: Ideal for rent payments, renewals, and birthdays.'
      ]
    },
    {
      icon: <Send className="h-8 w-8 text-sky-400" />,
      title: 'Instant Telegram DM Alerts',
      description: 'Connect our official Telegram Bot in under a minute to receive immediate alerts on your desktop or mobile.',
      points: [
        'Secure linkage via custom Telegram deep-linking token.',
        'Zero noise. The bot only sends the alerts you schedule.',
        'Parse formatting supported for clean, readable reminder payloads.'
      ]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-emerald-400" />,
      title: 'WhatsApp Pro Notifications (Coming Soon)',
      description: 'Get push alerts on the world\'s most popular messaging app. High visibility guarantees you never miss an event.',
      points: [
        'Delivered via Meta\'s official WhatsApp Cloud API.',
        'Clean template formats highlighting Time, Date, and message contents.',
        'Priority queue guarantees delivery even during peak network traffic.'
      ]
    },
    {
      icon: <Globe className="h-8 w-8 text-indigo-400" />,
      title: 'Timezone-Aware Delivery',
      description: 'Schedule reminders in any timezone. Our engine auto-converts to UTC and fires them exactly at your local time.',
      points: [
        'Auto-detects your browser timezone on the dashboard.',
        'Going on a trip? Switch timezone per reminder, not per account.',
        'Supports all IANA timezones including Asia, Americas, Europe, and more.'
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-yellow-400" />,
      title: 'Reminder History & Delivery Logs',
      description: 'Every reminder has a detailed delivery log so you always know if your alert was sent, pending, or failed.',
      points: [
        'Per-reminder status: Sent, Pending, or Failed with error details.',
        'Full history log accessible from the dashboard at any time.',
        'Retry information included for transient delivery failures.'
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

      <main className="flex-grow py-8 px-4 max-w-6xl mx-auto w-full relative">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Powerfully Simple Features
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed">
            Alert.my.id strips away complexity. We deliver on a single promise: remind you on the platforms you use most — Telegram now, WhatsApp coming soon.
          </p>
        </div>

        {/* Features list */}
        <div className="space-y-6">
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

        {/* CTA */}
        <div className="mt-10 text-center">
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
