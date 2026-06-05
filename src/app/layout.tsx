import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const runtime = 'edge'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alert.my.id — Never Miss What Matters",
  description: "Stay Alert. Stay Ahead. Receive simple, reliable event reminders via Email, Telegram, and WhatsApp exactly when you need them.",
  keywords: ["reminders", "email alerts", "telegram reminders", "whatsapp alerts", "recurring reminder", "saas", "scheduler"],
  authors: [{ name: "Alert.my.id Team" }],
  openGraph: {
    title: "Alert.my.id — Never Miss What Matters",
    description: "Stay Alert. Stay Ahead. Receive simple, reliable event reminders via Email, Telegram, and WhatsApp.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
