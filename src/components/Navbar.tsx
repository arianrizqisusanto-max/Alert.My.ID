'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { BellRing, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react'

export default function Navbar() {
  const { user, login, logout, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav className="glass-navbar sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <BellRing className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Alert<span className="text-violet-400">.my.id</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-white ${
                  isActive(link.href) ? 'text-violet-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-slate-800 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-colors duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-red-400 text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-violet-500/50"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white border border-violet-500/50">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={login}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={login}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-550/20 hover:shadow-indigo-550/30 transition-all duration-200"
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-slate-900 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? 'bg-violet-900/30 text-violet-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 pb-2 border-t border-slate-900 mt-2 px-3">
            {loading ? (
              <div className="h-10 w-full bg-slate-800 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-violet-500/50"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    logout()
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-xl text-sm font-medium bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    login()
                  }}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-900"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    login()
                  }}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center hover:from-violet-500 hover:to-indigo-500"
                >
                  Start Free Trial
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
