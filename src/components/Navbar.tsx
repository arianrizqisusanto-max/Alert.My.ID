'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { BellRing, LogOut, LayoutDashboard, User } from 'lucide-react'

export default function Navbar() {
  const { user, login, logout, loading } = useAuth()

  return (
    <nav className="glass-navbar sticky top-0 z-50 w-full py-2">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-lg">
                <BellRing className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                Alert<span className="text-violet-400">.my.id</span>
              </span>
            </Link>
          </div>

          {/* Auth Actions (Clean & Simple) */}
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="h-7 w-16 bg-slate-800 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full border border-violet-500/50"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-violet-600 flex items-center justify-center text-white border border-violet-500/50">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={login}
                  className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={login}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-200"
                >
                  Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
