import type { Metadata } from 'next'
import { Cinzel, EB_Garamond } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '600', '700'] })
const garamond = EB_Garamond({ subsets: ['latin'], variable: '--font-garamond', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: 'Beit HaTzaddik — Seminario Virtual',
  description: 'Formación espiritual integrada: teología reformada, tradición judía y psicología profunda',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${garamond.variable}`}>
      <body className="bg-[#0D0B08] text-[#F5EDD8] font-garamond antialiased">
        {children}
      </body>
    </html>
  )
}
