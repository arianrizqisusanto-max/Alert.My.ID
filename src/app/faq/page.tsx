'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const items = [
    {
      q: 'Can I use Alert.my.id for free?',
      a: 'Absolutely! Upon registering with Google Login, you receive a 30-day Free Trial instantly. This gives you unlimited reminders on all notification channels (Email, Telegram, and WhatsApp) so you can test the reliability and delivery speeds.'
    },
    {
      q: 'How do WhatsApp reminders work?',
      a: 'WhatsApp reminders use Meta\'s official WhatsApp Cloud API to deliver alerts as official template messages to your WhatsApp number. This guarantees delivery straight to your device. WhatsApp Pro plans include WhatsApp alerts.'
    },
    {
      q: 'How do I connect the Telegram Bot?',
      a: 'Connecting Telegram is extremely simple: 1) Go to your dashboard settings, 2) Click "Link Telegram", which redirects you to our bot, 3) Send `/start` to the bot. The bot will automatically verify your identity and save your chat ID.'
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, your subscription can be managed and cancelled anytime through the Billing section of your dashboard. If you cancel, your account will remain on the active tier until the end of your prepaid year, and will then downgrade.'
    },
    {
      q: 'Are recurring reminders supported?',
      a: 'Yes, we support multiple reminder frequencies. When scheduling, you can set the recurrence type to: One-Time, Daily, Weekly, Monthly, or Yearly. Once sent, our scheduler automatically computes the next delivery date.'
    },
    {
      q: 'How do timezones work?',
      a: 'Reminders are timezone-aware. When scheduling a reminder, you choose the timezone (e.g., Asia/Jakarta or America/New_York). Our backend converts the date and time to UTC, and triggers it exactly at that local time.'
    },
    {
      q: 'What happens if a notification fails to deliver?',
      a: 'If a channel fails (e.g., if a server drops), our system records a "Failed" status in your Reminder History Log along with the error message. In our Basic and Pro tiers, we automatically attempt retries for transient connection errors.'
    },
    {
      q: 'Can I send reminders to multiple channels at once?',
      a: 'Yes! You can check multiple boxes (e.g., both Email and Telegram) for a single reminder. Our delivery engine will queue and fire alerts to all selected channels simultaneously at the designated time.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-4 max-w-3xl mx-auto w-full relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-violet-650/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-violet-400" />
            <span>Help Center</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            Find answers to common questions about setting up reminders, billing inquiries, and notification channels.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isOpen = activeIndex === idx
            return (
              <div key={idx} className="glass-card rounded-2xl overflow-hidden hover:border-slate-800/80 transition-all duration-200">
                <button
                  onClick={() => setActiveIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-slate-200 hover:text-white transition-colors duration-250"
                >
                  <span className="text-sm md:text-base">{item.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-900/30 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Support section */}
        <div className="text-center mt-16 p-8 glass-card rounded-3xl max-w-xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-white">Still have questions?</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Can&apos;t find what you are looking for? Send us a message and our support team will get back to you within 24 hours.
          </p>
          <div>
            <a
              href="/contact"
              className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-550 transition-colors duration-200"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
