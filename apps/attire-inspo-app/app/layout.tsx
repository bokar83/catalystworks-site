// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import AuroraBackground from '@/components/AuroraBackground'
import BottomNav from '@/components/BottomNav'
import InstallPrompt from '@/components/InstallPrompt'

export const metadata: Metadata = {
  title: "Aminöa's AI — Attire Inspo",
  description: 'Your personal AI fashion stylist',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Attire Inspo',
  },
  icons: {
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#c77dff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden">
        <AuroraBackground />
        <main className="relative z-10 max-w-[480px] mx-auto pb-24 min-h-screen">
          {children}
        </main>
        <BottomNav />
        <InstallPrompt />
      </body>
    </html>
  )
}
