'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/lib/auth-context'
import {
  BellRing, Send, MessageSquare, Clock, ChevronDown, ChevronUp,
  Check, ArrowRight, Sparkles, Zap, Shield, Globe
} from 'lucide-react'

export default function Home() {
  const { login, user } = useAuth()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const handleCta = () => {
    if (user) window.location.href = '/dashboard'
    else login()
  }

  const faqs = [
    {
      q: 'Bagaimana cara kerja notifikasi Telegram?',
      a: 'Setelah daftar, kamu tinggal connect bot Telegram kami ke akun kamu. Kami akan kirim pesan langsung ke Telegram kamu tepat waktu — tanpa delay, tanpa spam.'
    },
    {
      q: 'Apakah bisa coba gratis dulu?',
      a: 'Ya! Setiap user baru dapat 30-Day Free Trial penuh. Semua fitur aktif, tidak perlu kartu kredit. Setelah 30 hari, pilih paket yang sesuai.'
    },
    {
      q: 'Kapan WhatsApp tersedia?',
      a: 'WhatsApp sedang dalam pengembangan aktif (Coming Soon). Kamu bisa pre-order paket WA sekarang dengan harga spesial $15/tahun dan kami akan notifikasi begitu siap.'
    },
    {
      q: 'Bisa buat reminder berulang?',
      a: 'Bisa! Pilih jenis reminder: sekali, harian, mingguan, bulanan, atau tahunan. Sistem kami otomatis menghitung jadwal berikutnya.'
    },
    {
      q: 'Apakah bisa cancel kapanpun?',
      a: 'Tentu. Tidak ada kontrak. Kamu bisa cancel auto-renew kapanpun dari dashboard. Akses tetap aktif sampai akhir periode billing.'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background ambient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 animate-glow"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/50 border border-violet-700/40 text-violet-300 text-xs font-bold uppercase tracking-widest mb-8 animate-slide-up">
            <Sparkles className="h-3.5 w-3.5" />
            <span>30 Hari Free Trial — Tanpa Kartu Kredit</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Reminder via{' '}
            <span className="text-gradient-primary">Telegram</span>
            <br />
            Cuma{' '}
            <span className="text-gradient-primary">$5</span>
            <span className="text-slate-300 text-4xl sm:text-5xl">/tahun</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Kirim pengingat otomatis langsung ke Telegram kamu — tepat waktu, setiap saat.
            Tidak perlu buka app, tidak perlu ingat-ingatan sendiri.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleCta}
              id="hero-cta-btn"
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 glow-violet transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Mulai Gratis 30 Hari</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-all duration-200 text-center"
            >
              Lihat Harga
            </a>
          </div>

          {/* Trust pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {['✅ Tepat Waktu', '🔒 Aman & Private', '⚡ Setup 2 Menit', '🌍 Timezone Support'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Setup dalam <span className="text-gradient-primary">2 Menit</span>
            </h2>
            <p className="mt-3 text-slate-400 text-sm">Tidak perlu teknis. Semua bisa diatur lewat dashboard sederhana kami.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: '01', icon: <BellRing className="h-6 w-6 text-violet-400" />, title: 'Daftar & Login', desc: 'Login dengan Google dalam satu klik. Langsung aktif 30 hari free.' },
              { num: '02', icon: <Send className="h-6 w-6 text-violet-400" />, title: 'Connect Telegram', desc: 'Ikuti panduan singkat untuk hubungkan bot Telegram ke akun kamu.' },
              { num: '03', icon: <Clock className="h-6 w-6 text-violet-400" />, title: 'Buat Reminder', desc: 'Tulis pesan, pilih waktu & timezone. Done. Kami yang akan kirim tepat waktu.' },
            ].map((step) => (
              <div key={step.num} className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-6xl font-black text-violet-900/20 select-none pointer-events-none leading-none">
                  {step.num}
                </div>
                <div className="p-2.5 bg-violet-950/50 border border-violet-800/30 rounded-xl w-fit mb-4">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Harga <span className="text-gradient-primary">Transparan</span>
            </h2>
            <p className="mt-3 text-slate-400 text-sm">Mulai gratis. Upgrade kapanpun. Cancel kapanpun.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* Free Trial */}
            <div className="glass-card rounded-3xl p-7 flex flex-col">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Free Trial</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-slate-500 text-sm">/ 30 Hari</span>
                </div>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">Coba semua fitur tanpa bayar. Tidak perlu kartu kredit.</p>
              </div>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {['Notifikasi Telegram', 'Unlimited Reminders', 'Timezone Support', 'Dashboard Lengkap'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCta}
                id="free-trial-btn"
                className="mt-8 w-full py-3 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-all duration-200 cursor-pointer"
              >
                Mulai Gratis
              </button>
            </div>

            {/* Telegram Pro ← POPULAR */}
            <div className="glass-card pricing-popular rounded-3xl p-7 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                Terpopuler
              </div>
              <div>
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Telegram Pro</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$5</span>
                  <span className="text-slate-400 text-sm">/ tahun</span>
                </div>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">Paling terjangkau untuk reminder otomatis via Telegram sepanjang tahun.</p>
              </div>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {[
                  'Notifikasi Telegram',
                  'Unlimited Reminders',
                  'Recurring Reminder',
                  'Timezone Support',
                  'Reminder History',
                  'Priority Support'
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <Check className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCta}
                id="telegram-pro-btn"
                className="mt-8 w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 glow-violet transition-all duration-300 cursor-pointer"
              >
                Langganan Telegram — $5/thn
              </button>
            </div>

            {/* WhatsApp — Coming Soon */}
            <div className="glass-card rounded-3xl p-7 flex flex-col relative overflow-hidden opacity-80">
              <div className="absolute top-0 right-0 bg-emerald-600/80 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                Coming Soon
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">WhatsApp Pro</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">$15</span>
                  <span className="text-slate-500 text-sm">/ tahun</span>
                </div>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">Notifikasi langsung ke WhatsApp kamu. Segera hadir — daftar antrian sekarang.</p>
              </div>
              <ul className="mt-6 space-y-2.5 flex-grow">
                {[
                  'Notifikasi WhatsApp',
                  'Semua fitur Telegram Pro',
                  'Priority Delivery',
                  'Exclusive Early Access',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCta}
                id="wa-notify-btn"
                className="mt-8 w-full py-3 rounded-xl text-sm font-bold bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Notify Me When Ready
              </button>
            </div>
          </div>

          {/* Comparison note */}
          <p className="text-center text-slate-600 text-xs mt-6">
            💡 Semua paket termasuk akses dashboard, timezone support, dan one-time + recurring reminders.
          </p>
        </div>
      </section>

      {/* ─── WHY US ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Kenapa <span className="text-gradient-primary">Alert.my.id</span>?
            </h2>
            <p className="mt-3 text-slate-400 text-sm">Tidak ada bloat. Fokus pada satu hal: kirim reminder tepat waktu.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Zap className="h-5 w-5 text-yellow-400" />, color: 'bg-yellow-950/40 border-yellow-800/30', title: 'Ringan & Cepat', desc: 'Tidak ada fitur yang tidak perlu. Dashboard super simpel, loading super cepat.' },
              { icon: <Shield className="h-5 w-5 text-violet-400" />, color: 'bg-violet-950/40 border-violet-800/30', title: 'Aman & Private', desc: 'Data reminder kamu tersimpan aman. Tidak dijual, tidak di-share ke pihak manapun.' },
              { icon: <Globe className="h-5 w-5 text-blue-400" />, color: 'bg-blue-950/40 border-blue-800/30', title: 'Timezone Aware', desc: 'Jadwal reminder pakai timezone kamu. Tidak perlu hitung manual lagi.' },
              { icon: <Clock className="h-5 w-5 text-pink-400" />, color: 'bg-pink-950/40 border-pink-800/30', title: 'Recurring Smart', desc: 'Ulangi harian, mingguan, bulanan, atau tahunan. Kami hitung otomatis.' },
              { icon: <Send className="h-5 w-5 text-sky-400" />, color: 'bg-sky-950/40 border-sky-800/30', title: 'Langsung ke Telegram', desc: 'Pesan terkirim langsung ke chat Telegram kamu. Tidak ada middleman.' },
              { icon: <BellRing className="h-5 w-5 text-emerald-400" />, color: 'bg-emerald-950/40 border-emerald-800/30', title: 'Harga Sangat Terjangkau', desc: 'Cuma $5/tahun untuk Telegram. Harga warung, kualitas enterprise.' },
            ].map((item, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4">
                <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 h-fit`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Pertanyaan <span className="text-gradient-primary">Umum</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx
              return (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    id={`faq-btn-${idx}`}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-slate-200 hover:text-white transition-colors duration-200 gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-violet-400 shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    }
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-16">
        <div className="divider-gradient mb-16" />
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14 border border-violet-500/20 relative overflow-hidden">
            {/* Glow bg */}
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-10"
              style={{ background: 'radial-gradient(circle at 50% 0%, #7c3aed, transparent 70%)' }}
            />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/60 border border-violet-700/40 text-violet-300 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Mulai Sekarang</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Stop lupa. Start <span className="text-gradient-primary">Alert</span>.
              </h2>
              <p className="mt-4 text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                30 hari gratis. Setelah itu cuma $5/tahun untuk Telegram.
                Login dengan Google — siap dalam 2 menit.
              </p>
              <button
                onClick={handleCta}
                id="bottom-cta-btn"
                className="mt-8 px-10 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 glow-violet transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Mulai Free Trial Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-4 text-slate-600 text-xs">Tidak perlu kartu kredit · Cancel kapanpun · Setup 2 menit</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
