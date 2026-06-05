'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { Check, X, ShieldAlert } from 'lucide-react'

export default function PricingPage() {
  const { login, user } = useAuth()

  const plans = [
    {
      id: 'free_trial',
      name: 'Free Trial',
      price: '$0',
      period: '30 Days',
      desc: 'Test the full platform features out-of-the-box.',
      features: [
        'Email Alerts',
        'Telegram Alerts',
        'WhatsApp Alerts',
        'Unlimited Reminders',
        'Standard Email Support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$12',
      period: 'per year',
      desc: 'Ideal for freelancers and professionals.',
      features: [
        'Email Alerts',
        'Telegram Alerts',
        'WhatsApp Alerts (Unavailable)',
        'Unlimited Reminders',
        'Reminder History Logs',
        'Priority Support',
      ],
      cta: 'Choose Basic Plan',
      popular: false,
      badge: '$1.00 / month'
    },
    {
      id: 'whatsapp_pro',
      name: 'WhatsApp Pro',
      price: '$36',
      period: 'per year',
      desc: 'The best value with high-priority WhatsApp push alerts.',
      features: [
        'Email Alerts',
        'Telegram Alerts',
        'WhatsApp Alerts',
        'Unlimited Reminders',
        'Reminder History Logs',
        'Priority Delivery Queue',
        'Priority Support',
      ],
      cta: 'Choose WhatsApp Pro',
      popular: true,
      badge: '$3.00 / month'
    }
  ]

  const comparison = [
    { feature: 'Yearly Cost', trial: '$0 (30 Days)', basic: '$12', pro: '$36' },
    { feature: 'Email Alerts', trial: true, basic: true, pro: true },
    { feature: 'Telegram Alerts', trial: true, basic: true, pro: true },
    { feature: 'WhatsApp Alerts', trial: true, basic: false, pro: true },
    { feature: 'Max Reminders', trial: 'Unlimited', basic: 'Unlimited', pro: 'Unlimited' },
    { feature: 'Reminder History', trial: '30 days limit', basic: 'Yes', pro: 'Yes' },
    { feature: 'Delivery Speed', trial: 'Standard', basic: 'Standard', pro: 'High Priority' },
    { feature: 'Support Level', trial: 'Standard', basic: 'Priority', pro: 'Priority 24/7' },
  ]

  const handleCta = () => {
    if (user) {
      window.location.href = '/dashboard/billing'
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
            Simple Plans for Every Need
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed">
            Get started with a 30-day free trial immediately upon login. No credit card required. Upgrade when you are ready.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto mb-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-3xl p-8 flex flex-col relative overflow-hidden ${
                plan.popular ? 'border-violet-500/50 ring-2 ring-violet-500/20' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
                  Recommended
                </span>
              )}
              
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{plan.desc}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-slate-500 text-sm ml-1.5">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-grow border-t border-slate-900/60 pt-6">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2.5 text-slate-350 text-xs leading-relaxed">
                    <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button
                  onClick={handleCta}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold text-center transition-all duration-200 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-650/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="hidden md:block">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white tracking-tight">Compare Plan Features</h2>
            <p className="text-slate-400 text-xs mt-2">See exactly what is included in each plan tier</p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-slate-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900">
                  <th className="p-6 text-sm font-semibold text-white">Features</th>
                  <th className="p-6 text-sm font-semibold text-white">Free Trial</th>
                  <th className="p-6 text-sm font-semibold text-white">Basic</th>
                  <th className="p-6 text-sm font-semibold text-white">WhatsApp Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/20 transition-colors duration-150">
                    <td className="p-6 font-medium text-slate-200">{row.feature}</td>
                    
                    {/* Free Trial column */}
                    <td className="p-6">
                      {typeof row.trial === 'boolean' ? (
                        row.trial ? <Check className="h-4 w-4 text-violet-400" /> : <X className="h-4 w-4 text-slate-600" />
                      ) : (
                        row.trial
                      )}
                    </td>

                    {/* Basic column */}
                    <td className="p-6">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? <Check className="h-4 w-4 text-violet-400" /> : <X className="h-4 w-4 text-slate-600" />
                      ) : (
                        row.basic
                      )}
                    </td>

                    {/* WhatsApp Pro column */}
                    <td className="p-6 font-semibold text-white">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="h-4 w-4 text-violet-400" /> : <X className="h-4 w-4 text-slate-650" />
                      ) : (
                        row.pro
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security / Terms note */}
        <div className="mt-12 text-center max-w-md mx-auto flex items-center space-x-2.5 justify-center text-[10px] text-slate-500">
          <ShieldAlert className="h-4 w-4 text-slate-650 shrink-0" />
          <span>Subscriptions are managed securely via Stripe. Cancel anytime to prevent recurring yearly charges.</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
