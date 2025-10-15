import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProviders } from '@/components/providers/SessionProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Funnder - AI Voice Demo',
  description: 'Try our AI voice demo in seconds',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviders>
          {children}
        </SessionProviders>
        {/* Demo environment banner (bottom) */}
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-sm text-center py-2 border-t border-yellow-200 z-50">
          Disclaimer:This is a demo .
        </div>
      </body>
    </html>
  )
}
