import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'
import { getSiteMetadata } from '@/lib/metadata'
import PopupManager from '@/components/PopupManager'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getSiteMetadata()
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    authors: [{ name: metadata.author }],
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Script 
          src="https://cdn.tailwindcss.com" 
          strategy="beforeInteractive"
        />
        <ToastProvider>
          {children}
          <PopupManager />
        </ToastProvider>
      </body>
    </html>
  )
}
