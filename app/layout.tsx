import type { Metadata } from 'next'
import { Noto_Serif, Manrope } from 'next/font/google'
import './globals.css'

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Prosper with Em',
  description: 'Internal CRM for Prosper with Em finance coaching',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${manrope.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
