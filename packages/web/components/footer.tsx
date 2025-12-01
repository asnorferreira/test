import Link from "next/link"
import { Youtube, Linkedin, Facebook, Instagram } from "lucide-react"
import { Button } from "@/packages/web/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <span className="text-3xl font-bold">JSP</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Solucoes completas em terceirizacao e gestao de facilities para sua empresa.
            </p>
            <div className="mt-8">
              <p className="text-sm text-white/70 mb-4">Pronto para começar?</p>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0f172a] transition hover:bg-gray-100"
              >
                FALE CONOSCO
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Sobre a JSP</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/quem-somos" className="text-sm text-white/70 hover:text-white transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-sm text-white/70 hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Serviços</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/servicos/administrativo"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Administrativo
                </Link>
              </li>
              <li>
                <Link href="/servicos/limpeza" className="text-sm text-white/70 hover:text-white transition-colors">
                  Limpeza e Conservação
                </Link>
              </li>
              <li>
                <Link href="/servicos/gerais" className="text-sm text-white/70 hover:text-white transition-colors">
                  Serviços Gerais
                </Link>
              </li>
              <li>
                <Link
                  href="/servicos/arquitetura-engenharia"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Arquitetura e Engenharia
                </Link>
              </li>
              <li>
                <Link href="/servicos/transporte" className="text-sm text-white/70 hover:text-white transition-colors">
                  Transporte e Logística
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Carreiras</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/carreiras" className="text-sm text-white/70 hover:text-white transition-colors">
                  Por que a JSP?
                </Link>
              </li>
              <li>
                <Link href="/curriculo" className="text-sm text-white/70 hover:text-white transition-colors">
                  Enviar Currículo
                </Link>
              </li>
              <li>
                <Link href="/vagas" className="text-sm text-white/70 hover:text-white transition-colors">
                  Vagas Disponíveis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Clientes</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/clientes" className="text-sm text-white/70 hover:text-white transition-colors">
                  Nossos Parceiros
                </Link>
              </li>
              <li>
                <Link href="/cases" className="text-sm text-white/70 hover:text-white transition-colors">
                  Cases de Sucesso
                </Link>
              </li>
              <li>
                <Link href="/depoimentos" className="text-sm text-white/70 hover:text-white transition-colors">
                  Depoimentos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex gap-6 text-sm text-white/70">
              <Link href="/termos" className="hover:text-white transition-colors">
                Termos e Condições
              </Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/lgpd" className="hover:text-white transition-colors">
                LGPD
              </Link>
              <Link href="/ajuda" className="hover:text-white transition-colors">
                Central de Ajuda
              </Link>
            </div>

            <div className="flex gap-4">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
