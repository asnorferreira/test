

import '../styles/globals.css'
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata = {
  title: 'Mãe Mais',
  description: 'Cuidar de quem cuida com amor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='pt-BR' className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
