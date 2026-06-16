'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { 
  BellRing, Calendar, PlusCircle, Settings, 
  CreditCard, LogOut, Loader2, Sparkles, User
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, subscription, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const menuItems = [
    { name: 'Reminders', href: '/dashboard', icon: <Calendar className="h-4.5 w-4.5" /> },
    { name: 'New Reminder', href: '/dashboard/create', icon: <PlusCircle className="h-4.5 w-4.5" /> },
    { name: 'Channel Settings', href: '/dashboard/settings', icon: <Settings className="h-4.5 w-4.5" /> },
    { name: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="h-4.5 w-4.5" /> },
  ]

  const [trialDays, setTrialDays] = useState(0)

  useEffect(() => {
    if (subscription && subscription.plan_id === 'free_trial') {
      const end = new Date(subscription.end_date).getTime()
      const diff = end - Date.now()
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      setTrialDays(days)
    }
  }, [subscription])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          <span className="text-sm text-slate-400">Loading your workspace...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Dashboard Sidebar */}
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between py-4 px-3">
        <div className="space-y-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group px-2">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <BellRing className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">
              Alert<span className="text-violet-400">.my.id</span>
            </span>
          </Link>

          {/* Trial banner */}
          {subscription?.plan_id === 'free_trial' && (
            <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                <Sparkles className="h-3 w-3 text-violet-400 opacity-60 animate-pulse-slow" />
              </div>
              <h4 className="text-xs font-bold text-violet-350 flex items-center space-x-1">
                <span>Free Trial Mode</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                You have <strong>{trialDays} days</strong> remaining. Upgrade to retain alerts.
              </p>
              <Link
                href="/dashboard/billing"
                className="mt-3 block text-center w-full py-1.5 rounded-lg bg-violet-650 hover:bg-violet-600 text-white text-[10px] font-semibold transition-colors"
              >
                Upgrade Plan
              </Link>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-violet-900/25 border-l-2 border-violet-500 text-violet-450'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar (User Info & Logout) */}
        <div className="space-y-4 pt-6 border-t border-slate-900 mt-6 md:mt-0">
          <div className="flex items-center space-x-3 px-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-full border border-violet-500/30"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center text-white border border-violet-500/30">
                <User className="h-4.5 w-4.5" />
              </div>
            )}
            <div className="min-w-0 flex-grow">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/10 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-5 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  )
}
