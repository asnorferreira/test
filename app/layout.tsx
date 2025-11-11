import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsappIcon } from "@/components/icons/whatsapp"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const montserrat = Montserrat({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JSP - Gestão de Facilities e Terceirização",
  description: "Soluções completas em terceirização de mão de obra para empresas que buscam excelência operacional."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <Header />
        {children}
        <Footer />
        <a
          href="https://wa.me/558199884985"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[100] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          aria-label="Falar conosco pelo WhatsApp"
        >
          <WhatsappIcon className="w-7 h-7 text-white" />
        </a>
        <Analytics />
      </body>
    </html>
  )
}
