'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import {
  BellRing, Send, MessageSquare, Clock, ChevronDown, ChevronUp,
  Check, ArrowRight, Sparkles, Zap, Shield, Globe
} from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
  }

  const faqs = [
    {
      q: 'How do Telegram reminders work?',
      a: 'After signing up, simply connect our Telegram bot to your account in a few clicks. We\'ll send your reminders directly to your Telegram chat — exactly on time, every time.'
    },
    {
      q: 'Can I try it for free?',
      a: 'Yes! Every new user gets a full 30-Day Free Trial with unlimited reminders. No credit card required. Upgrade only when you\'re ready.'
    },
    {
      q: 'When will WhatsApp be available?',
      a: 'WhatsApp support is actively in development (Coming Soon). You can notify us of your interest now and we\'ll reach out as soon as it\'s live at the special price of $15/year.'
    },
    {
      q: 'Can I set recurring reminders?',
      a: 'Absolutely. When creating a reminder, choose from one-time, daily, weekly, monthly, or yearly. Our scheduler automatically computes the next delivery date after each send.'
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. No contracts, no lock-ins. Cancel auto-renewal anytime from your dashboard with a single click. You keep access until the end of your billing period.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background ambient glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 animate-glow"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/50 border border-violet-700/40 text-violet-300 text-xs font-bold uppercase tracking-widest mb-8 animate-slide-up">
            <Sparkles className="h-3.5 w-3.5" />
            <span>30-Day Free Trial — No Credit Card Required</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Telegram Reminders
            <br />
            for just{' '}
            <span className="text-gradient-primary">$5</span>
            <span className="text-slate-300 text-4xl sm:text-5xl">/year</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Send automated reminders directly to your Telegram — on time, every time.
            No apps to open. No missed deadlines. No stress.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleCta}
              id="hero-cta-btn"
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 glow-violet transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Start 30-Day Free Trial</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-all duration-200 text-center"
            >
              View Pricing
            </a>
          </div>

          {/* Trust pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {['✅ Always On Time', '🔒 Secure & Private', '⚡ 2-Minute Setup', '🌍 Timezone Aware'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Up and running in <span className="text-gradient-primary">2 minutes</span>
            </h2>
            <p className="mt-3 text-slate-400 text-sm">No technical setup. Everything is managed from a clean, simple dashboard.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: '01', icon: <BellRing className="h-6 w-6 text-violet-400" />, title: 'Sign Up & Log In', desc: 'One-click Google Login. Your 30-day free trial activates instantly.' },
              { num: '02', icon: <Send className="h-6 w-6 text-violet-400" />, title: 'Connect Telegram', desc: 'Follow our quick guide to link our bot to your Telegram account. Takes under a minute.' },
              { num: '03', icon: <Clock className="h-6 w-6 text-violet-400" />, title: 'Create a Reminder', desc: 'Write your message, pick a date, time & timezone. We handle the rest — on time, every time.' },
            ].map((step) => (
              <div key={step.num} className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-6xl font-black text-violet-900/20 select-none pointer-events-none leading-none">
                  {step.num}
                </div>
                <div className="p-2.5 bg-violet-950/50 border border-violet-800/30 rounded-xl w-fit mb-4">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Simple, <span className="text-gradient-primary">Transparent</span> Pricing
            </h2>
            <p className="mt-3 text-slate-400 text-sm">Start free. Upgrade anytime. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* Free Trial */}
            <div className="glass-card rounded-3xl p-7 flex flex-col">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Free Trial</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-slate-500 text-sm">/ 30 Days</span>
                </div>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">Try everything free. No credit card needed.</p>
              </div>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {['Telegram Notifications', 'Unlimited Reminders', 'Timezone Support', 'Full Dashboard Access'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCta}
                id="free-trial-btn"
                className="mt-8 w-full py-3 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-200 cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Telegram Pro ← POPULAR */}
            <div className="glass-card pricing-popular rounded-3xl p-7 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                Most Popular
              </div>
              <div>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Telegram Pro</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$5</span>
                  <span className="text-slate-400 text-sm">/ year</span>
                </div>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">The most affordable way to never miss a reminder — all year long.</p>
              </div>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {[
                  'Telegram Notifications',
                  'Unlimited Reminders',
                  'Recurring Reminders',
                  'Timezone Support',
                  'Reminder History',
                  'Priority Support'
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCta}
                id="telegram-pro-btn"
                className="mt-8 w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 glow-violet transition-all duration-300 cursor-pointer"
              >
                Get Telegram Pro — $5/yr
              </button>
            </div>

            {/* WhatsApp — Coming Soon */}
            <div className="glass-card rounded-3xl p-7 flex flex-col relative overflow-hidden opacity-80">
              <div className="absolute top-0 right-0 bg-emerald-600/80 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                Coming Soon
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">WhatsApp Pro</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$15</span>
                  <span className="text-slate-500 text-sm">/ year</span>
                </div>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">Reminders delivered directly to your WhatsApp. Launching soon — join the waitlist.</p>
              </div>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {[
                  'WhatsApp Notifications',
                  'Everything in Telegram Pro',
                  'Priority Delivery Queue',
                  'Exclusive Early Access',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCta}
                id="wa-notify-btn"
                className="mt-8 w-full py-3 rounded-xl text-sm font-bold bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Notify Me When Ready
              </button>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            💡 All plans include dashboard access, timezone support, one-time & recurring reminders.
          </p>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Why <span className="text-gradient-primary">Alert.my.id</span>?
            </h2>
            <p className="mt-3 text-slate-400 text-sm">No bloat. No complexity. Just one promise: deliver your reminders on time.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Zap className="h-5 w-5 text-yellow-400" />, color: 'bg-yellow-950/40 border-yellow-800/30', title: 'Fast & Lightweight', desc: 'No unnecessary features. A super clean dashboard that loads instantly.' },
              { icon: <Shield className="h-5 w-5 text-violet-400" />, color: 'bg-violet-950/40 border-violet-800/30', title: 'Secure & Private', desc: 'Your reminder data is stored securely. Never sold or shared with anyone.' },
              { icon: <Globe className="h-5 w-5 text-blue-400" />, color: 'bg-blue-950/40 border-blue-800/30', title: 'Timezone Aware', desc: 'Schedule in your local timezone. We\'ll deliver at exactly the right time, globally.' },
              { icon: <Clock className="h-5 w-5 text-pink-400" />, color: 'bg-pink-950/40 border-pink-800/30', title: 'Smart Recurring', desc: 'Set daily, weekly, monthly, or yearly reminders. We auto-calculate the next one.' },
              { icon: <Send className="h-5 w-5 text-sky-400" />, color: 'bg-sky-950/40 border-sky-800/30', title: 'Direct to Telegram', desc: 'Reminders land straight in your Telegram chat. No redirect, no middleman.' },
              { icon: <BellRing className="h-5 w-5 text-emerald-400" />, color: 'bg-emerald-950/40 border-emerald-800/30', title: 'Unbeatable Price', desc: 'Just $5/year for Telegram. Less than a cup of coffee — for a whole year of peace of mind.' },
            ].map((item, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4">
                <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 h-fit`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Frequently Asked <span className="text-gradient-primary">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    id={`faq-btn-${idx}`}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors duration-200 gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-violet-400 shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    }
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14 border border-violet-500/20 relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-10"
              style={{ background: 'radial-gradient(circle at 50% 0%, #7c3aed, transparent 70%)' }}
            />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/60 border border-violet-700/40 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Get Started Today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Stop forgetting. Start{' '}
                <span className="text-gradient-primary">Alerting</span>.
              </h2>
              <p className="mt-4 text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                30 days completely free. Then just $5/year for Telegram.
                Sign in with Google — ready in under 2 minutes.
              </p>
              <button
                onClick={handleCta}
                id="bottom-cta-btn"
                className="mt-8 px-10 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 glow-violet transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Start Free Trial Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 text-slate-600 text-xs">No credit card · Cancel anytime · 2-minute setup</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
