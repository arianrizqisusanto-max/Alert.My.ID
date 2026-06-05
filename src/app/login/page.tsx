'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BellRing, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleGoogleLogin = async () => {
    try {
      await login()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden bg-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Brand Header */}
      <Link href="/" className="flex items-center space-x-2 group mb-8 relative z-10">
        <div className="p-2 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-xl group-hover:rotate-12 transition-transform duration-300">
          <BellRing className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">
          Alert<span className="text-violet-400">.my.id</span>
        </span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-sm glass-card rounded-3xl p-8 border border-slate-900 relative z-10">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-xs text-slate-400">
              Sign in with your Google account to manage your reminders.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-200 text-xs font-semibold flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
            >
              {/* Google logo SVG */}
              <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38C16.88,16.07,14.76,17.4,12,17.4c-3.53,0-6.4-2.87-6.4-6.4s2.87-6.4,6.4-6.4c1.54,0,2.94,0.55,4.04,1.46l2.02-2.02C16.31,2.41,14.28,1.6,12,1.6C6.26,1.6,1.6,6.26,1.6,12S6.26,22.4,12,22.4c5.78,0,10.1-4.06,10.1-10.1C22.1,11.75,22.02,11.41,21.35,11.1z" fill="#EA4335" />
                  <path d="M12,22.4c5.78,0,10.1-4.06,10.1-10.1c0-0.55-0.08-0.89-0.75-1.2H12v2.7h5.38c-0.5,2.27-2.62,3.6-5.38,3.6" fill="#4285F4" />
                  <path d="M12,22.4c-3.53,0-6.4-2.87-6.4-6.4s2.87-6.4,6.4-6.4" fill="#FBBC05" />
                  <path d="M12,1.6C6.26,1.6,1.6,6.26,1.6,12" fill="#34A853" />
                </g>
              </svg>
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-900 text-center flex flex-col space-y-1 text-[10px] text-slate-550">
            <span>By clicking continue, you agree to our</span>
            <span>
              <Link href="/terms" className="hover:text-slate-300 underline">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="hover:text-slate-300 underline">Privacy Policy</Link>.
            </span>
          </div>
        </div>
      </div>

      {/* Trust Badge / Features Callout */}
      <div className="mt-8 text-center max-w-xs flex items-center space-x-2.5 justify-center text-[10px] text-slate-500">
        <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
        <span>No credit card required for 30-day Free Trial. Start scheduling instantly.</span>
      </div>
    </div>
  )
}
