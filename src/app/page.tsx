'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import { 
  BellRing, Mail, Send, MessageSquare, Clock, Globe, ShieldAlert,
  ChevronDown, ChevronUp, Check, ArrowRight, Sparkles
} from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const steps = [
    {
      num: '01',
      title: 'Create a Reminder',
      desc: 'Type your title, message, and select the exact date, time, and timezone in our clean dashboard.'
    },
    {
      num: '02',
      title: 'Choose Channels',
      desc: 'Select where you want to be notified. Choose Email, Telegram, WhatsApp, or all three simultaneously.'
    },
    {
      num: '03',
      title: 'Receive Your Alert',
      desc: 'Our cron engine processes alerts globally and triggers notifications exactly when you need them.'
    },
    {
      num: '04',
      title: 'Stay Ahead',
      desc: 'Never forget appointments, client meetings, project deadlines, or renewals again. Keep winning.'
    }
  ]

  const features = [
    { icon: <Clock className="h-6 w-6 text-violet-400" />, title: 'One-Time Reminders', desc: 'Set quick alerts for single events, deadlines, or one-off tasks.' },
    { icon: <Sparkles className="h-6 w-6 text-pink-400" />, title: 'Recurring Reminders', desc: 'Set alerts that repeat daily, weekly, monthly, or yearly automatically.' },
    { icon: <Mail className="h-6 w-6 text-blue-400" />, title: 'Email Alerts', desc: 'Deliver clean, rich reminders straight to your email inbox.' },
    { icon: <Send className="h-6 w-6 text-sky-400" />, title: 'Telegram Alerts', desc: 'Direct message alerts from our bot instantly to your Telegram.' },
    { icon: <MessageSquare className="h-6 w-6 text-emerald-400" />, title: 'WhatsApp Alerts', desc: 'Premium, direct message alerts to your phone via WhatsApp.' },
    { icon: <Globe className="h-6 w-6 text-purple-400" />, title: 'Timezone Support', desc: 'Fully timezone-aware. Schedule local, get delivered local.' },
    { icon: <ShieldAlert className="h-6 w-6 text-yellow-400" />, title: 'Reminder History', desc: 'Detailed delivery status logs (Sent, Pending, Failed).' },
    { icon: <BellRing className="h-6 w-6 text-indigo-400" />, title: 'Easy Dashboard', desc: 'Clean, minimalist view optimized for speed. Non-cluttered design.' },
  ]

  const plans = [
    {
      id: 'free_trial',
      name: 'Free Trial',
      price: '$0',
      period: '30 Days',
      desc: 'Experience the full power of Alert.my.id risk-free.',
      features: [
        'Email Notifications',
        'Telegram Notifications',
        'WhatsApp Notifications',
        'Unlimited Reminders',
        'Timezone Support',
        '30 Days Validity'
      ],
      cta: 'Start 30 Days Free',
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$12',
      period: 'per year',
      desc: 'Perfect for professionals, developers, and freelancers.',
      features: [
        'Email Notifications',
        'Telegram Notifications',
        'Unlimited Reminders',
        'Reminder History Logs',
        'Priority Support',
        'Best for daily habits'
      ],
      cta: 'Upgrade to Basic',
      popular: false
    },
    {
      id: 'whatsapp_pro',
      name: 'WhatsApp Pro',
      price: '$36',
      period: 'per year',
      desc: 'The ultimate scheduling package for busy entrepreneurs.',
      features: [
        'Everything in Basic',
        'WhatsApp Notifications',
        'Multiple Reminder Alerts',
        'Priority Delivery Queue',
        'Exclusive Feature Previews',
        'Ultimate reliability'
      ],
      cta: 'Get WhatsApp Pro',
      popular: true
    }
  ]

  const faqs = [
    {
      q: 'Can I use Alert for free?',
      a: 'Yes! Every new user gets a 30-day Free Trial with unlimited reminders on all channels (Email, Telegram, and WhatsApp) immediately upon Google Login. No credit card is required to start.'
    },
    {
      q: 'How do WhatsApp reminders work?',
      a: 'WhatsApp reminders are sent directly to your WhatsApp number. Since WhatsApp requires official templates for business-initiated chats, we deliver beautiful pre-formatted templates containing your reminder details instantly.'
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Absolutely. All our plans are yearly subscriptions, and you can cancel auto-renewal at any time from your billing dashboard with a single click. You will retain access until the end of your billing cycle.'
    },
    {
      q: 'Do recurring reminders exist?',
      a: 'Yes! When creating a reminder, you can choose if it is a One-Time alert, or if it should repeat Daily, Weekly, Monthly, or Yearly. Our cron scheduler automatically computes the next delivery date upon sending.'
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

      {/* Hero Section */}
      <section className="relative pt-4 pb-4 md:pt-6 md:pb-6 overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-violet-950/40 border border-violet-800/40 text-violet-400 text-xs font-semibold mb-3 animate-pulse-slow">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Introducing 30-Day Unlimited Free Trial</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Never Miss <span className="text-gradient-primary">What Matters</span>.
          </h1>
          <p className="mt-2.5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Get reminders via Email, Telegram, and WhatsApp exactly when you need them.
            Simple, timezone-aware, and 100% reliable.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleCta}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-indigo-650/20 hover:shadow-indigo-650/30 flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/features"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white transition-all duration-200 text-center"
            >
              View Features
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-6 pt-4 border-t border-slate-900/60 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-semibold tracking-wider uppercase">
            <span>🚀 Freelancers</span>
            <span>💼 Entrepreneurs</span>
            <span>🎓 Students</span>
            <span>📱 Content Creators</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-8 border-t border-slate-900/50 bg-slate-950/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-slate-400">
              Create and receive alerts in 4 simple steps. No configuration headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-5xl font-extrabold text-violet-850/20 group-hover:text-violet-800/20 transition-colors duration-300 pointer-events-none select-none">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mt-4">{step.title}</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Engineered for Simplicity & Speed
            </h2>
            <p className="mt-4 text-slate-400">
              We focus on a single promise: delivering reminders. No complex planners or feature bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col items-start">
                <div className="p-3 bg-slate-900 rounded-xl mb-4 border border-slate-800/80">
                  {feat.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-100">{feat.title}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-8 border-t border-slate-900/50 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-slate-400">
              Upgrade when your trial ends. Cancel anytime with a single click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`glass-card rounded-3xl p-8 flex flex-col relative overflow-hidden ${
                  plan.popular ? 'border-violet-500/50 ring-2 ring-violet-500/20' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">{plan.desc}</p>
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                    <span className="text-slate-500 text-sm ml-2">/ {plan.period}</span>
                  </div>
                </div>

                <ul className="mt-8 space-y-3 flex-grow">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-2.5 text-slate-300 text-xs">
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
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 border-t border-slate-900/50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-slate-400">
              Find answers to common questions about our platform and delivery.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left font-medium text-slate-200 hover:text-white transition-colors duration-200"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-900/30 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-8 relative bg-slate-950/30 border-t border-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-violet-500/20 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
              Stay Alert. Stay Ahead.
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Create your account with a single Google Login click and start setting reminders instantly on Email, Telegram, and WhatsApp.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleCta}
                className="px-8 py-4 rounded-xl text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 flex items-center space-x-2 transition-all duration-200 shadow-xl cursor-pointer"
              >
                <span>Start Free Trial Now</span>
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
