'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { Check, X, ShieldAlert, MessageSquare } from 'lucide-react'

export default function PricingPage() {
  const { login, user } = useAuth()

  const plans = [
    {
      id: 'free_trial',
      name: 'Free Trial',
      price: '$0',
      period: '30 Days',
      desc: 'Try the full platform free. No credit card required.',
      features: [
        'Telegram Notifications',
        'Unlimited Reminders',
        'Timezone Support',
        'Reminder History',
        'Dashboard Access',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      id: 'telegram_pro',
      name: 'Telegram Pro',
      price: '$5',
      period: 'per year',
      desc: 'The most affordable way to never miss a reminder — all year long.',
      features: [
        'Telegram Notifications',
        'Unlimited Reminders',
        'Recurring Reminders',
        'Timezone Support',
        'Reminder History Logs',
        'Priority Support',
      ],
      cta: 'Get Telegram Pro',
      popular: true,
      badge: '~$0.42 / month'
    },
    {
      id: 'whatsapp_pro',
      name: 'WhatsApp Pro',
      price: '$15',
      period: 'per year',
      desc: 'Reminders delivered to WhatsApp. Launching soon — join the waitlist.',
      features: [
        'WhatsApp Notifications',
        'Everything in Telegram Pro',
        'Priority Delivery Queue',
        'Exclusive Early Access',
      ],
      cta: 'Notify Me When Ready',
      popular: false,
      comingSoon: true,
      badge: 'Coming Soon'
    }
  ]

  const comparison = [
    { feature: 'Yearly Cost', trial: '$0 (30 Days)', telegram: '$5', wa: '$15' },
    { feature: 'Telegram Alerts', trial: true, telegram: true, wa: true },
    { feature: 'WhatsApp Alerts', trial: false, telegram: false, wa: true },
    { feature: 'Unlimited Reminders', trial: true, telegram: true, wa: true },
    { feature: 'Recurring Reminders', trial: true, telegram: true, wa: true },
    { feature: 'Timezone Support', trial: true, telegram: true, wa: true },
    { feature: 'Reminder History', trial: '30 days', telegram: 'Full', wa: 'Full' },
    { feature: 'Support Level', trial: 'Standard', telegram: 'Priority', wa: 'Priority 24/7' },
  ]

  const handleCta = (planId: string) => {
    if (planId === 'whatsapp_pro') {
      // Waitlist action — just trigger login/dashboard for now
      if (user) window.location.href = '/dashboard'
      else login()
      return
    }
    if (user) window.location.href = '/dashboard/billing'
    else login()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 px-4 max-w-6xl mx-auto w-full relative">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed">
            Start free for 30 days. Then just $5/year for Telegram. WhatsApp coming soon at $15/year.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-3xl p-7 flex flex-col relative overflow-hidden ${
                plan.popular ? 'border-violet-500/40 ring-2 ring-violet-500/20' : ''
              } ${plan.comingSoon ? 'opacity-80' : ''}`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                  Most Popular
                </span>
              )}
              {plan.comingSoon && (
                <span className="absolute top-0 right-0 bg-emerald-600/80 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                  Coming Soon
                </span>
              )}
              
              <div className="mb-5">
                <div className="flex justify-between items-start">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                    plan.popular ? 'text-violet-400' : plan.comingSoon ? 'text-emerald-400' : 'text-slate-500'
                  }`}>{plan.name}</p>
                  {plan.badge && !plan.comingSoon && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-slate-500 text-sm">/ {plan.period}</span>
                </div>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-grow border-t border-slate-900/60 pt-5">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${
                      plan.comingSoon ? 'text-emerald-500' : 'text-violet-400'
                    }`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <button
                  onClick={() => handleCta(plan.id)}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg glow-violet'
                      : plan.comingSoon
                      ? 'bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/40'
                      : 'bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {plan.comingSoon && <MessageSquare className="h-4 w-4" />}
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="hidden md:block">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">Compare Plan Features</h2>
            <p className="text-slate-400 text-xs mt-2">See exactly what is included in each plan tier</p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900">
                  <th className="p-5 text-sm font-semibold text-white">Features</th>
                  <th className="p-5 text-sm font-semibold text-white">Free Trial</th>
                  <th className="p-5 text-sm font-semibold text-violet-300">Telegram Pro <span className="text-violet-500 text-xs">$5/yr</span></th>
                  <th className="p-5 text-sm font-semibold text-emerald-300">WhatsApp Pro <span className="text-emerald-600 text-xs">Soon</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/20 transition-colors duration-150">
                    <td className="p-5 font-medium text-slate-200">{row.feature}</td>
                    <td className="p-5">
                      {typeof row.trial === 'boolean' ? (
                        row.trial ? <Check className="h-4 w-4 text-violet-400" /> : <X className="h-4 w-4 text-slate-600" />
                      ) : row.trial}
                    </td>
                    <td className="p-5">
                      {typeof row.telegram === 'boolean' ? (
                        row.telegram ? <Check className="h-4 w-4 text-violet-400" /> : <X className="h-4 w-4 text-slate-600" />
                      ) : row.telegram}
                    </td>
                    <td className="p-5 font-semibold text-white">
                      {typeof row.wa === 'boolean' ? (
                        row.wa ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />
                      ) : row.wa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-10 text-center max-w-md mx-auto flex items-center space-x-2.5 justify-center text-[10px] text-slate-500">
          <ShieldAlert className="h-4 w-4 text-slate-650 shrink-0" />
          <span>Subscriptions are managed securely via Stripe. Cancel anytime to prevent recurring yearly charges.</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
