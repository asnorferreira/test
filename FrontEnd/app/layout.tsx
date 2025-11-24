import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Opta Plataform - Plataforma Esportiva Completa",
  description: "Estatísticas esportivas em tempo real, análises de jogadores e muito mais",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
