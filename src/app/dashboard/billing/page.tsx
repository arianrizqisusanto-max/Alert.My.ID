'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabaseService, Subscription } from '@/lib/supabase/service'
import { createCheckoutSession } from '@/lib/stripe'
import { 
  CreditCard, Check, ShieldCheck, Sparkles, 
  Calendar, Loader2, ArrowRight
} from 'lucide-react'

export default function BillingPage() {
  const { user, subscription, refreshUser } = useAuth()
  
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState(false)
  
  useEffect(() => {
    // Check if redirected back with success query
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setSuccessMsg(true)
      // Remove query parameters
      window.history.replaceState({}, document.title, window.location.pathname)
      // Dispatch custom refresh event
      window.dispatchEvent(new CustomEvent('auth-refresh'))
    }
  }, [])

  const plans = [
    {
      id: 'telegram_pro',
      name: 'Telegram Pro',
      price: '$5',
      period: 'year',
      features: [
        'Telegram Notifications',
        'Unlimited Reminders',
        'Recurring Reminders',
        'Reminder History Logs',
        'Priority Support',
      ],
      description: 'The most affordable way to never miss a reminder — all year long.'
    },
    {
      id: 'whatsapp_pro',
      name: 'WhatsApp Pro',
      price: '$15',
      period: 'year',
      features: [
        'Everything in Telegram Pro',
        'WhatsApp Notifications',
        'Priority Delivery Queue',
        'Priority Support 24/7',
      ],
      description: 'Reminders direct to WhatsApp. Coming soon — join the waitlist.',
      comingSoon: true
    }
  ]

  const getTrialRemainingDays = () => {
    if (!subscription) return 0
    const end = new Date(subscription.end_date).getTime()
    const diff = end - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) return
    setLoadingCheckout(planId)
    try {
      const checkoutUrl = await createCheckoutSession(user.id, user.email, planId)
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (err) {
      console.error(err)
      setLoadingCheckout(null)
    }
  }

  const getPlanFriendlyName = (id: string) => {
    switch (id) {
      case 'free_trial': return '30-Day Free Trial'
      case 'basic': return 'Basic Plan'
      case 'whatsapp_pro': return 'WhatsApp Pro'
      default: return 'No Plan'
    }
  }

  const remainingDays = getTrialRemainingDays()
  const percentRemaining = subscription?.plan_id === 'free_trial' 
    ? Math.round((remainingDays / 30) * 100) 
    : 100

  // Simulated invoice history
  const invoices = [
    { id: 'inv_01', date: '2026-06-05', amount: '$0.00', status: 'Paid', plan: 'Free Trial Signup' }
  ]
  
  if (subscription?.plan_id === 'basic') {
    invoices.unshift({ id: 'inv_02', date: new Date(subscription.start_date).toISOString().split('T')[0], amount: '$12.00', status: 'Paid', plan: 'Basic Plan Yearly' })
  } else if (subscription?.plan_id === 'whatsapp_pro') {
    invoices.unshift({ id: 'inv_03', date: new Date(subscription.start_date).toISOString().split('T')[0], amount: '$36.00', status: 'Paid', plan: 'WhatsApp Pro Yearly' })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Billing & Subscriptions</h1>
        <p className="text-xs text-slate-400 mt-1">Manage payments, invoices, subscription tiers, and limits.</p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs flex items-center space-x-2">
          <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
          <span>Subscription plan upgraded successfully! Your dashboard capabilities are updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Current status card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-900 relative overflow-hidden">
            {subscription?.plan_id === 'free_trial' && (
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Active Plan</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {subscription ? getPlanFriendlyName(subscription.plan_id) : 'Loading...'}
                </h2>
              </div>
              <div>
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-900/30 text-violet-400 text-xs font-bold capitalize">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {subscription?.status}
                </span>
              </div>
            </div>

            <div className="py-6 space-y-6">
              {/* Progress bar (only for trials) */}
              {subscription?.plan_id === 'free_trial' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Trial Progress</span>
                    <span className="text-white">{remainingDays} Days Left</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className="bg-gradient-to-r from-violet-600 to-pink-500 h-full rounded-full" 
                      style={{ width: `${percentRemaining}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Subscription details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2 text-slate-455">
                  <Calendar className="h-4.5 w-4.5 text-slate-550 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-500">Billing Period Started</div>
                    <div className="text-slate-300 mt-0.5">
                      {subscription ? new Date(subscription.start_date).toLocaleDateString() : '...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-455">
                  <Calendar className="h-4.5 w-4.5 text-slate-550 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-500">Subscription Expiration Date</div>
                    <div className="text-slate-300 mt-0.5">
                      {subscription ? new Date(subscription.end_date).toLocaleDateString() : '...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade tiers list (only show plans not matching current subscription) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Available Plans</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {plans.map((plan) => {
                const isActive = subscription?.plan_id === plan.id
                const isTrial = subscription?.plan_id === 'free_trial'
                const canUpgrade = isTrial || (subscription?.plan_id === 'basic' && plan.id === 'whatsapp_pro')

                return (
                  <div 
                    key={plan.id} 
                    className={`glass-card rounded-2xl p-6 border flex flex-col justify-between ${
                      isActive ? 'border-violet-500/40 bg-violet-950/5' : 'border-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                        {isActive && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[10px] mt-1.5 leading-normal">{plan.description}</p>
                      
                      <div className="mt-4 flex items-baseline">
                        <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-slate-500 text-xs ml-1">/ {plan.period}</span>
                      </div>

                      <ul className="mt-4 space-y-2 border-t border-slate-900/60 pt-4 flex-grow">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-[10px] text-slate-300">
                            <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-2">
                      {isActive ? (
                        <button 
                          disabled 
                          className="w-full py-2 px-3 rounded-lg bg-slate-900 text-slate-550 border border-slate-850 text-xs font-semibold cursor-not-allowed"
                        >
                          Current Subscription
                        </button>
                      ) : canUpgrade ? (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={loadingCheckout !== null}
                          className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-550 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-violet-650/10 cursor-pointer"
                        >
                          {loadingCheckout === plan.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Redirecting...</span>
                            </>
                          ) : (
                            <>
                              <span>Upgrade to {plan.name}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <button 
                          disabled 
                          className="w-full py-2 px-3 rounded-lg bg-slate-950 text-slate-650 border border-slate-900 text-xs font-semibold cursor-not-allowed"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Invoice history sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-5 border border-slate-900 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-violet-450" />
              <span>Invoice Receipts</span>
            </h3>

            <div className="divide-y divide-slate-900/60">
              {invoices.map((inv) => (
                <div key={inv.id} className="py-3.5 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{inv.plan}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{inv.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{inv.amount}</div>
                    <span className="inline-flex items-center text-[9px] font-bold text-emerald-450 bg-emerald-950/20 px-2 py-0.5 rounded-full mt-1">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-card rounded-3xl p-5 border border-slate-900 text-[11px] text-slate-400 leading-normal space-y-2">
            <h4 className="font-bold text-slate-300">Billing FAQ</h4>
            <p><strong>Are prices recurring?</strong> Yes, basic and pro subscriptions renew automatically each year. You can turn off auto-renewal at any time.</p>
            <p><strong>Can I upgrade basic to pro later?</strong> Yes, you will only be charged the prorated difference for the remainder of your year.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
