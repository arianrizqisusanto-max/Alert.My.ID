'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabaseService } from '@/lib/supabase/service'
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutMock() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('planId') || 'basic'

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (user) {
      setCardName(user.name)
    }
  }, [user])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number: groups of 4 digits
    const cleaned = e.target.value.replace(/\D/g, '').substring(0, 16)
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    setCardNumber(formatted)
  }

  const handleExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').substring(0, 4)
    if (cleaned.length >= 3) {
      setCardExp(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`)
    } else {
      setCardExp(cleaned)
    }
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))
  }

  const getPlanDetails = () => {
    if (planId === 'whatsapp_pro') {
      return { name: 'WhatsApp Pro', price: '$36.00', period: 'year' }
    }
    return { name: 'Basic Plan', price: '$12.00', period: 'year' }
  }

  const plan = getPlanDetails()

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !cardNumber || !cardExp || !cardCvc) return
    setPaying(true)

    // Simulate payment processing time
    setTimeout(async () => {
      try {
        // Update subscription to active
        await supabaseService.updateSubscription(user.id, planId, 'active')
        // Dispatch refresh event to update context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-refresh'))
        }
        // Redirect back with success token
        router.push('/dashboard/billing?success=true')
      } catch (err) {
        console.error(err)
        setPaying(false)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel and return</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-900 rounded-2xl">
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Stripe Sandbox Secure</span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-violet-950/40 border border-violet-900/30 text-violet-400 font-bold uppercase tracking-wider">
            Simulated
          </span>
        </div>

        {/* Payment Card Form */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-900">
          <h2 className="text-lg font-bold text-white mb-6">Payment Checkout</h2>

          {/* Plan Invoice summary */}
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl mb-6 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">{plan.name} Subscription</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Billed annually</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-white text-lg">{plan.price}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">/{plan.period}</div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            {/* Cardholder Name */}
            <div className="space-y-1.5">
              <label htmlFor="card-name" className="text-xs font-semibold text-slate-350">
                Cardholder Name
              </label>
              <input
                type="text"
                id="card-name"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 focus:outline-none focus:border-violet-500/40"
                placeholder="John Doe"
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1.5">
              <label htmlFor="card-num" className="text-xs font-semibold text-slate-350 flex items-center space-x-1.5">
                <CreditCard className="h-4 w-4 text-slate-550" />
                <span>Card Number</span>
              </label>
              <input
                type="text"
                id="card-num"
                required
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 focus:outline-none focus:border-violet-500/40"
                placeholder="4242 4242 4242 4242"
              />
            </div>

            {/* Exp Date & CVC row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="card-exp" className="text-xs font-semibold text-slate-350">
                  Expiration Date
                </label>
                <input
                  type="text"
                  id="card-exp"
                  required
                  value={cardExp}
                  onChange={handleExpChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 focus:outline-none focus:border-violet-500/40 text-center"
                  placeholder="MM/YY"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="card-cvc" className="text-xs font-semibold text-slate-350">
                  CVC (Security Code)
                </label>
                <input
                  type="text"
                  id="card-cvc"
                  required
                  value={cardCvc}
                  onChange={handleCvcChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-200 focus:outline-none focus:border-violet-500/40 text-center"
                  placeholder="123"
                />
              </div>
            </div>

            {/* Pay Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={paying}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Pay {plan.price} Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Stripe Badge note */}
        <div className="text-center text-[10px] text-slate-600 leading-normal flex items-center space-x-2 justify-center">
          <span>Locked Sandbox. No real transactions are executed. Feel free to use test numbers like 4242.</span>
        </div>
      </div>
    </div>
  )
}
