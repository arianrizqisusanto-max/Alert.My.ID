import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ShieldCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-900">
            <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl text-violet-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-slate-500 text-xs mt-1">Last Updated: June 5, 2026</p>
            </div>
          </div>

          {/* Policy Body */}
          <div className="text-slate-300 text-xs md:text-sm space-y-6 leading-relaxed">
            <p>
              At Alert.my.id, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy describes how we collect, store, use, and safeguard your data when you use our SaaS reminder application.
            </p>

            <h2 className="text-lg font-semibold text-white pt-4">1. Information We Collect</h2>
            <p>
              We collect information necessary to deliver our reminder services:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-slate-400">
              <li><strong>Account Information:</strong> When signing in with Google OAuth, we receive your email, full name, and avatar image. We do not store or collect passwords.</li>
              <li><strong>Notification Tokens:</strong> To send alerts, we collect and store your Telegram chat ID (when linked) and your WhatsApp phone number (when configured).</li>
              <li><strong>Reminders Data:</strong> We store the titles, messages, dates, times, timezones, and channel choices of the reminders you schedule.</li>
            </ul>

            <h2 className="text-lg font-semibold text-white pt-4">2. How We Use Your Information</h2>
            <p>
              We use your information strictly to operate and maintain Alert.my.id:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-slate-400">
              <li>To schedule, process, and send reminders to your selected channels.</li>
              <li>To process payments and manage subscriptions via Stripe.</li>
              <li>To send service announcements or respond to support requests.</li>
            </ul>

            <h2 className="text-lg font-semibold text-white pt-4">3. Data Sharing & Third Parties</h2>
            <p>
              We do not sell your personal data. We share details only with critical service providers required to deliver the alerts:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-slate-400">
              <li><strong>Resend:</strong> For email notification delivery.</li>
              <li><strong>Telegram API:</strong> To send direct messages via our bot.</li>
              <li><strong>Meta (WhatsApp Cloud API):</strong> To deliver template alerts to WhatsApp numbers.</li>
              <li><strong>Stripe:</strong> For secure credit card processing and billing management.</li>
            </ul>

            <h2 className="text-lg font-semibold text-white pt-4">4. Security</h2>
            <p>
              We use standard encryption protocols to protect database tables, row level security to isolate data between users, and HTTPS for all API communications. However, no internet transmission is 100% secure.
            </p>

            <h2 className="text-lg font-semibold text-white pt-4">5. Your Choices & Deletion</h2>
            <p>
              You can view, edit, or delete any reminder from the dashboard at any time. If you wish to delete your account and all associated profile, subscription, and reminder history data, please contact us at support@alert.my.id.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
