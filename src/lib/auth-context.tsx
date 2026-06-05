'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabaseService, UserProfile, Subscription } from '@/lib/supabase/service'

interface AuthContextType {
  user: UserProfile | null
  subscription: Subscription | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const u = await supabaseService.getUser()
      setUser(u)
      if (u) {
        const sub = await supabaseService.getSubscription(u.id)
        setSubscription(sub)
      } else {
        setSubscription(null)
      }
    } catch (err) {
      console.error('Error refreshing auth context:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      refreshUser()
    }, 0)
    
    // Listen for custom trigger events to refresh state (e.g. after mock purchases)
    const handleAuthRefresh = () => {
      refreshUser()
    }
    window.addEventListener('auth-refresh', handleAuthRefresh)
    return () => {
      window.removeEventListener('auth-refresh', handleAuthRefresh)
    }
  }, [])

  const login = async () => {
    setLoading(true)
    try {
      const { url } = await supabaseService.signInWithGoogle()
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabaseService.signOut()
      setUser(null)
      setSubscription(null)
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, subscription, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export type { UserProfile, Subscription };
