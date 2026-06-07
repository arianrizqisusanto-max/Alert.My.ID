import React from 'react'
import Link from 'next/link'
import { BellRing, Shield, Scale } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-lg">
                <BellRing className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Alert<span className="text-violet-400">.my.id</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Stay Alert. Stay Ahead. The simplest, most reliable reminder platform. Get alerts via Telegram now — WhatsApp coming soon.
            </p>
          </div>

          {/* Links: Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Product</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/features" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Legal */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Legal</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors duration-200">
                  <Shield className="h-3.5 w-3.5 text-slate-500" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors duration-200">
                  <Scale className="h-3.5 w-3.5 text-slate-500" />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-4 pt-4 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Alert.my.id. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 mt-2 md:mt-0 flex items-center space-x-1">
            <span>Built for speed, simplicity, and absolute peace of mind.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
