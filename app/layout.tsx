import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { Manrope, Sora, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import { AuthSessionSync } from '@/components/auth-session-sync'
import './globals.css'
import { Providers } from './providers'

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: 'Smart Insert - Plateforme de Recrutement',
  description: 'Smart Insert est votre plateforme de recrutement en ligne pour connecter candidats et entreprises. Trouvez le poste ideal ou le talent parfait.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ea7b24",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${manrope.variable} ${sora.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <AuthSessionSync />
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
