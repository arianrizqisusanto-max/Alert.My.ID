import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Scale } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-900">
            <div className="p-2 bg-slate-900 border border-slate-850 rounded-xl text-violet-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-slate-500 text-xs mt-1">Last Updated: June 5, 2026</p>
            </div>
          </div>

          {/* Terms Body */}
          <div className="text-slate-300 text-xs md:text-sm space-y-6 leading-relaxed">
            <p>
              Welcome to Alert.my.id. By accessing or using our website, service, or APIs, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>

            <h2 className="text-lg font-semibold text-white pt-4">1. Use of Service</h2>
            <p>
              Alert.my.id is a simple reminder SaaS application. You agree to use the service only for lawful scheduling and task alert purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-slate-400">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are solely responsible for all reminders created and sent under your account.</li>
              <li>You agree not to use the service to send spam, harassing alerts, or bulk messaging campaigns.</li>
            </ul>

            <h2 className="text-lg font-semibold text-white pt-4">2. Subscriptions & Billing</h2>
            <p>
              Certain features require a paid subscription (Basic Plan or WhatsApp Pro):
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-slate-400">
              <li>Our services are billed on a yearly subscription basis via Stripe.</li>
              <li>All plans start with a 30-day Free Trial. You will not be charged unless you manually select to upgrade.</li>
              <li>Subscriptions auto-renew annually unless cancelled before the renewal date.</li>
            </ul>

            <h2 className="text-lg font-semibold text-white pt-4">3. Delivery & Disclaimer of Reliability</h2>
            <p>
              While we strive to maintain a 99.9% uptime and deliver messages instantly, notifications rely on third-party API gateways (Meta for WhatsApp, Telegram Bot API, and Resend for Email):
            </p>
            <p className="text-slate-450 italic">
              &quot;We provide the service on an &apos;as is&apos; and &apos;as available&apos; basis. We cannot guarantee that notifications will always be delivered on time or without interruption due to factors outside our direct control.&quot;
            </p>

            <h2 className="text-lg font-semibold text-white pt-4">4. Limitation of Liability</h2>
            <p>
              In no event shall Alert.my.id, its developers, or affiliates be liable for any damages (including lost profits, lost savings, or business interruption) resulting from the late delivery, failed delivery, or unavailability of scheduled alerts.
            </p>

            <h2 className="text-lg font-semibold text-white pt-4">5. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms (e.g. attempting to abuse WhatsApp template limits or spamming our API gateways).
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
