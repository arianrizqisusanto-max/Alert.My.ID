# 🏗️ Alert.My.ID — Arsitektur Sistem

> **100% Serverless · Tanpa Google Cloud Console · Target 1 Juta Pengguna**

---

## 📌 Ringkasan

Alert.My.ID adalah layanan reminder/alert yang mengirim notifikasi tepat waktu via **Telegram** dan **WhatsApp**. Seluruh infrastruktur berjalan di **Cloudflare** — tidak ada Google Cloud Console, tidak ada server yang dikelola manual.

---

## 🧱 Stack Teknologi

| Layer | Teknologi | Fungsi |
|---|---|---|
| **Frontend** | Next.js 16 + React 19 | Landing page, dashboard, UI |
| **Runtime** | Cloudflare Workers | Serverless compute (edge) |
| **Database** | Cloudflare D1 (SQLite) | Data users, reminders, plans, logs |
| **Scheduling** | Cloudflare Durable Objects | Alarm per-reminder, recurring scheduler |
| **Auth** | Supabase Auth | Google OAuth login |
| **Payment** | Stripe | Subscription billing |
| **Notifikasi** | Telegram Bot API | Kirim reminder via Telegram |
| **Notifikasi** | WhatsApp Cloud API (Meta) | Kirim reminder via WhatsApp |
| **Email** | Resend API | Transactional email |
| **Build** | OpenNext.js for Cloudflare | Kompilasi Next.js → Workers |
| **Domain** | Cloudflare DNS | alert.my.id |

---

## 🔄 Alur Kerja Utama

### 1. User Membuat Reminder

```
User → Dashboard UI → POST /api/reminders
                            ↓
                    Simpan ke D1 Database
                            ↓
                    Buat Durable Object (DO)
                    per reminder_id
                            ↓
                    DO.setAlarm(timestamp)
                    ← Cloudflare menyimpan alarm
```

### 2. Alarm Terpicu (Waktu Tiba)

```
Cloudflare Edge membangunkan DO
            ↓
    DO.alarm() dipanggil
            ↓
    Baca reminder data dari DO storage
            ↓
    Cek status di D1 (masih active?)
            ↓
    Kirim notifikasi:
    ├── Telegram → Bot Pool → sendMessage API
    └── WhatsApp → Cloud API → template message
            ↓
    Log hasil kirim ke D1 (reminder_logs)
            ↓
    Jika recurring → hitung tanggal berikutnya
                   → setAlarm() ulang
    Jika one_time → update status = "completed"
```

### 3. Login & Auth

```
User klik "Login with Google"
        ↓
    Supabase Auth → Google OAuth
        ↓
    Callback → /api/auth/callback
        ↓
    Buat/update user di D1
        ↓
    Set JWT session cookie (HMAC-SHA256)
        ↓
    Redirect ke /dashboard
```

---

## 📊 Diagram Arsitektur

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE EDGE                          │
│                                                                  │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────────┐  │
│  │   Workers    │    │  D1 Database │    │  Durable Objects   │  │
│  │  (Next.js)   │───▶│  (SQLite)    │    │  (Alarm Scheduler) │  │
│  │             │    │              │    │                    │  │
│  │  - Pages    │    │  - users     │    │  - 1 DO per        │  │
│  │  - API      │    │  - reminders │    │    reminder        │  │
│  │  - Webhooks │    │  - plans     │    │  - setAlarm()      │  │
│  │             │    │  - subs      │    │  - alarm() trigger │  │
│  │             │    │  - logs      │    │  - auto recurring  │  │
│  │             │    │  - bots      │    │                    │  │
│  └──────┬──────┘    └──────────────┘    └─────────┬──────────┘  │
│         │                                          │             │
└─────────┼──────────────────────────────────────────┼─────────────┘
          │                                          │
          ▼                                          ▼
┌─────────────────┐  ┌──────────────┐  ┌───────────────────────┐
│  Supabase Auth  │  │   Stripe     │  │   Telegram Bot API    │
│  (Google OAuth) │  │  (Payments)  │  │                       │
└─────────────────┘  └──────────────┘  │  Bot 1 → 500 users   │
                                       │  Bot 2 → 500 users   │
┌─────────────────┐                    │  Bot 3 → 500 users   │
│  Resend API     │                    │  Bot N → ...          │
│  (Email)        │                    └───────────────────────┘
└─────────────────┘
                                       ┌───────────────────────┐
                                       │  WhatsApp Cloud API   │
                                       │  (Meta Business)      │
                                       └───────────────────────┘
```

---

## 🤖 Telegram Bot Pool (Multi-Bot Sharding)

Telegram memiliki limit **30 pesan/detik per bot**. Untuk menangani 1 juta pengguna, kita menggunakan **Bot Pool** — banyak bot yang bekerja bersama.

### Cara Kerja

```
User baru mendaftar
        ↓
getOrAssignBotForUser()
        ↓
Cari bot dengan user_count terendah (load balancing)
        ↓
Assign bot ke user di tabel `users.telegram_bot_id`
        ↓
Increment user_count di tabel `telegram_bots`
```

### Kapasitas

| Bot Count | Max Users | Max Msg/Detik |
|---|---|---|
| 1 bot | 500 | 30 |
| 10 bot | 5,000 | 300 |
| 100 bot | 50,000 | 3,000 |
| 2,000 bot | 1,000,000 | 60,000 |

### Schema

```sql
-- Tabel telegram_bots
CREATE TABLE telegram_bots (
  id TEXT PRIMARY KEY,
  bot_username TEXT UNIQUE NOT NULL,
  bot_token TEXT NOT NULL,
  user_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Referensi di tabel users
ALTER TABLE users ADD COLUMN telegram_bot_id TEXT REFERENCES telegram_bots(id);
```

### Auto-Register

Saat pool kosong, sistem otomatis mendaftarkan bot default dari `TELEGRAM_BOT_TOKEN` env var, termasuk:
1. Panggil `getMe` API untuk dapatkan username
2. Insert ke tabel `telegram_bots`
3. Set webhook ke `/api/webhooks/telegram?bot_id=xxx`

---

## 🗄️ Database Schema (Cloudflare D1)

### Tabel Utama

| Tabel | Deskripsi | Kolom Kunci |
|---|---|---|
| `users` | Data pengguna | id, email, name, telegram_chat_id, whatsapp_number, telegram_bot_id, google_sync_enabled |
| `plans` | Paket langganan | id, name, price, features (JSON) |
| `subscriptions` | Langganan aktif | user_id, plan_id, status, stripe_subscription_id |
| `reminders` | Reminder yang dibuat | user_id, title, message, date, time, timezone, channels, recurring_type, status |
| `reminder_logs` | Log pengiriman | reminder_id, channel, delivery_status, error_message |
| `telegram_bots` | Pool bot Telegram | bot_username, bot_token, user_count, status |

### Paket Harga

| Plan | Harga/bulan | Telegram | WhatsApp | Priority |
|---|---|---|---|---|
| Free Trial | $0 | ✅ | ✅ | - |
| Basic | $12 | ✅ | ❌ | Priority Support |
| WhatsApp Pro | $36 | ✅ | ✅ | Priority Delivery |

---

## 🔗 API Endpoints

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/api/reminders` | Buat reminder baru |
| `GET` | `/api/reminders` | List reminders user |
| `DELETE` | `/api/reminders/[id]` | Hapus reminder |
| `POST` | `/api/auth/callback` | Supabase OAuth callback |
| `GET` | `/api/user` | Get current user profile |
| `POST` | `/api/subscription` | Manage subscription |
| `POST` | `/api/webhooks/telegram` | Webhook dari Telegram Bot |
| `POST` | `/api/webhooks/stripe` | Webhook dari Stripe |
| `POST` | `/api/cron` | Cron fallback (backup) |

---

## ⏰ Durable Objects — Scheduler

Setiap reminder mendapatkan **1 Durable Object instance** sendiri. Ini menghilangkan kebutuhan cron polling ke database.

### Endpoint DO Internal

| Path | Fungsi |
|---|---|
| `/schedule` | Set alarm pada timestamp tertentu |
| `/cancel` | Batalkan alarm |

### Recurring Support

| Tipe | Logika |
|---|---|
| `one_time` | Kirim sekali → status = "completed" |
| `daily` | +1 hari → setAlarm() ulang |
| `weekly` | +7 hari → setAlarm() ulang |
| `monthly` | +1 bulan → setAlarm() ulang |
| `yearly` | +1 tahun → setAlarm() ulang |

### Konfigurasi Wrangler

```jsonc
{
  "durable_objects": {
    "bindings": [{
      "name": "REMINDER_SCHEDULER",
      "class_name": "ReminderScheduler"
    }]
  },
  "migrations": [{
    "tag": "v1",
    "new_sqlite_classes": ["ReminderScheduler"]  // Required untuk free plan
  }]
}
```

---

## 🔐 Autentikasi

### Flow

1. **Login**: Supabase Auth → Google OAuth 2.0
2. **Session**: JWT (HMAC-SHA256) disimpan di httpOnly cookie
3. **Expiry**: 30 hari
4. **Middleware**: Cek session di setiap request ke `/dashboard/*`

### Session Cookie

```
Cookie: alert_session=<JWT>
- httpOnly: true
- secure: true
- sameSite: lax
- maxAge: 30 hari
```

---

## 💳 Payment (Stripe)

### Flow

```
User pilih plan → createCheckoutSession()
        ↓
    Stripe Checkout (hosted)
        ↓
    Webhook /api/webhooks/stripe
        ↓
    Update subscription di D1
```

### Mock Mode

Saat `NEXT_PUBLIC_MOCK_MODE=true`, semua payment menggunakan mock checkout tanpa Stripe API call.

---

## 🌍 Kenapa Tanpa Google Cloud Console?

| Aspek | Google Cloud | Cloudflare (Pilihan Kita) |
|---|---|---|
| **Complexity** | Banyak service, IAM, billing rumit | Satu dashboard, simple |
| **Cold Start** | Cloud Functions: 100ms-1s | Workers: 0ms (edge) |
| **Database** | Firestore/Cloud SQL (mahal) | D1 (gratis tier besar) |
| **Scheduling** | Cloud Scheduler + Pub/Sub | Durable Objects (built-in) |
| **Pricing** | Per-invocation + egress | Generous free tier |
| **Global** | Region-based | Edge (300+ lokasi) |
| **Setup** | Console + gcloud CLI + IAM | Dashboard + wrangler CLI |

---

## 📈 Scaling untuk 1 Juta Pengguna

### Bottleneck & Solusi

| Bottleneck | Solusi |
|---|---|
| Telegram 30 msg/s limit | Bot Pool (2000 bot = 60K msg/s) |
| D1 read limit | Read replicas (otomatis dari Cloudflare) |
| D1 write limit | Batch writes, queue per-region |
| Workers CPU time | Otomatis scale (Cloudflare edge) |
| Durable Objects | 1 DO per reminder, unlimited instances |

### Estimasi Biaya (1M Users)

| Service | Free Tier | Estimasi Biaya |
|---|---|---|
| Workers | 100K req/hari gratis | ~$5/bulan (Workers Paid) |
| D1 | 5M rows read/hari gratis | ~$5/bulan |
| Durable Objects | 1M req/bulan gratis | ~$10-20/bulan |
| Supabase Auth | 50K MAU gratis | ~$25/bulan (Pro) |
| Stripe | 2.9% + $0.30/txn | Variable |
| Resend | 3K email/bulan gratis | ~$20/bulan |
| **TOTAL** | | **~$65-75/bulan** |

> 💡 Dibanding Google Cloud yang bisa **$200-500+/bulan** untuk scale serupa.

---

## 📁 Struktur Direktori

```
Alert.My.ID/
├── migrations/
│   ├── d1-schema.sql              # Schema utama D1
│   └── 0002_telegram_bot_pool.sql # Migration bot pool
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # OAuth callback
│   │   │   ├── cron/              # Cron fallback
│   │   │   ├── reminders/         # CRUD reminders
│   │   │   ├── subscription/      # Stripe management
│   │   │   ├── user/              # User profile
│   │   │   └── webhooks/          # Telegram & Stripe webhooks
│   │   ├── dashboard/             # Protected dashboard pages
│   │   ├── contact/               # Halaman kontak
│   │   ├── faq/                   # FAQ
│   │   ├── features/              # Fitur
│   │   ├── login/                 # Login page
│   │   ├── pricing/               # Pricing page
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms of service
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable React components
│   ├── lib/
│   │   ├── cloudflare/
│   │   │   ├── reminder-scheduler.ts  # Durable Object class
│   │   │   └── session.ts             # JWT session management
│   │   ├── notifications/
│   │   │   ├── bot-pool.ts        # Telegram bot pool/sharding
│   │   │   ├── telegram.ts        # Telegram API wrapper
│   │   │   ├── whatsapp.ts        # WhatsApp Cloud API wrapper
│   │   │   └── email.ts           # Resend email wrapper
│   │   ├── supabase/              # Supabase client & service
│   │   ├── auth-context.tsx       # React auth context
│   │   ├── stripe.ts              # Stripe integration
│   │   └── timezones.ts           # Timezone helpers
│   ├── middleware.ts              # Auth middleware
│   └── worker-deploy.ts           # Custom worker entry (DO export)
├── wrangler.jsonc                 # Cloudflare Workers config
├── package.json                   # Dependencies
└── ARCHITECTURE.md                # 📄 File ini
```

---

## 🔧 Environment Variables

| Variable | Service | Keterangan |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram | Token bot default |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp | Phone number ID dari Meta |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp | Access token Meta Business |
| `WHATSAPP_ENABLED` | WhatsApp | Enable/disable WhatsApp |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public anon key |
| `STRIPE_SECRET_KEY` | Stripe | Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | Stripe | Price ID Basic plan |
| `NEXT_PUBLIC_STRIPE_WHATSAPP_PRICE_ID` | Stripe | Price ID WhatsApp Pro |
| `JWT_SECRET` | Session | HMAC signing secret |
| `RESEND_API_KEY` | Resend | Email API key |
| `RESEND_FROM_EMAIL` | Resend | Sender email |
| `NEXT_PUBLIC_MOCK_MODE` | Dev | Toggle mock mode |
| `NEXT_PUBLIC_APP_URL` | App | Base URL (https://alert.my.id) |

---

## 🚀 Deploy Commands

```bash
# Development
npm run dev

# Preview (lokal dengan Wrangler)
npm run preview

# Production deploy
npm run deploy
# = opennextjs-cloudflare build && wrangler deploy

# Buat database D1
npx wrangler d1 create alert-db

# Jalankan migration
npx wrangler d1 execute alert-db --file=migrations/d1-schema.sql
npx wrangler d1 execute alert-db --file=migrations/0002_telegram_bot_pool.sql
```

---

## ✅ Checklist Produksi

- [x] Deploy ke Cloudflare Workers
- [x] D1 Database dibuat (`alert-db`)
- [x] Durable Objects dengan `new_sqlite_classes`
- [x] Supabase Auth configured
- [x] Landing page responsive
- [ ] Stripe live keys configured
- [ ] Telegram bot(s) production tokens
- [ ] WhatsApp Business API setup
- [ ] Resend domain verified
- [ ] Custom domain SSL (alert.my.id)
- [ ] Rate limiting di API
- [ ] Monitoring & alerting

---

*Terakhir diupdate: 19 Juni 2026*
