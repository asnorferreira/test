import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/app/web/components/header"
import { Footer } from "@/app/web/components/footer"
import { PageShell } from "@/app/web/components/page-shell"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })

export const metadata: Metadata = {
  title: "JSP - Gestão de Facilities e Terceirização",
  description: "Soluções completas em terceirização de mão de obra para empresas que buscam excelência operacional.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <PageShell>
          <Header />
          {children}
          <Footer />
          <Analytics />
        </PageShell>
      </body>
    </html>
  )
}
