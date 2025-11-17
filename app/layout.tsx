import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { ConstructionBackground } from '@/components/ui/construction-background'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Civilabs - Construction Engineering LMS',
  description: 'Immersive Learning Management System for Civil Engineering Education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <ConstructionBackground />
        {children}
      </body>
    </html>
  )
}
