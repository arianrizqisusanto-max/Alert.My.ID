'use client'

import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Send, CheckCircle2, MessageSquare, Mail } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return

    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    }, 1200)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 px-4 max-w-5xl mx-auto w-full relative">


        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start mt-6">
          {/* Info Panel */}
          <div className="md:col-span-2 space-y-6 md:pr-4">
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Get in Touch
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Have a feature request, question about API quotas, billing issue, or need custom integration help? Drop us a line and we will reply as quickly as possible.
            </p>

            <div className="space-y-4 pt-6 border-t border-slate-900">
              <div className="flex items-center space-x-3.5 text-xs text-slate-350">
                <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-violet-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">General Support</div>
                  <div className="text-slate-400 mt-0.5">support@alert.my.id</div>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 text-xs text-slate-350">
                <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-emerald-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">WhatsApp / Telegram Integrations</div>
                  <div className="text-slate-400 mt-0.5">api@alert.my.id</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-3">
            <div className="glass-card rounded-3xl p-8 border border-slate-900 relative">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="inline-flex p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl text-emerald-400 mb-2">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Sent Successfully!</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. A support engineer has been notified, and we will get back to you at your email address shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold text-slate-300">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-semibold text-slate-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors"
                      placeholder="Billing question, API request, etc."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-slate-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
