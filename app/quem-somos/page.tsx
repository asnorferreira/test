import { Shield, Users2, Lightbulb, Handshake } from "lucide-react"
import { WhatsappIcon } from "@/components/icons/whatsapp"

const values = [
  {
    title: "Excelencia em Servicos",
    description:
      "Processos monitorados, indicadores de qualidade e equipes treinadas continuamente para superar expectativas.",
    icon: Shield,
  },
  {
    title: "Parceria de Longo Prazo",
    description:
      "Atuamos lado a lado com cada cliente para entender necessidades, antecipar demandas e gerar resultados sustentaveis.",
    icon: Handshake,
  },
  {
    title: "Inovacao e Agilidade",
    description:
      "Investimos em tecnologia, capacitacao e boas praticas para entregar respostas rapidas e solucoes inteligentes.",
    icon: Lightbulb,
  },
]

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen bg-white pt-32">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Quem Somos</p>
            <h1 className="text-5xl font-bold mt-4 mb-6">JSP Servicos e Terceirizacao de Mao de Obra</h1>
            <p className="text-xl leading-relaxed text-white/90">
              Ha 13 anos entregamos performance operacional e qualidade humana em cada solucao de terceirizacao,
              apoiando empresas a crescer com seguranca e foco em seus objetivos estrategicos.
            </p>
          </div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Quem somos?</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Somos a JSP Servicos e Terceirizacao de Mao de Obra. Atuamos no mercado ha 13 anos com profissionais
                comprometidos e capacitados para a prestacao de servicos. Buscamos fidelizar nossos clientes oferecendo
                servicos de qualidade e entregando resultados com excelencia.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nosso time e formado por especialistas que entendem os desafios do dia a dia operacional. Acreditamos em
                relacionamentos transparentes, comunicacao ativa e melhoria continua como base para entregar impacto
                real.
              </p>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1400&auto=format&fit=crop"
                alt="Equipe JSP reunida em reuniao de planejamento"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossa proposta de valor</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Construimos parcerias solidas apoiadas em governanca, processos e pessoas. Conheca os pilares que orientam
              cada entrega:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ title, description, icon: Icon }) => (
              <div key={title} className="bg-gray-50 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop"
                alt="Equipe JSP em acao"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Nossa equipe</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Contamos com profissionais registrados, treinados e acompanhados por uma estrutura de gestao presente em
                todo o ciclo do contrato. Supervisores dedicados, coordenadores de campo e especialistas em seguranca do
                trabalho garantem operacoes alinhadas com seus padroes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Treinamento continuo</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Programas periodicos de capacitacao tecnica, comportamental e de seguranca.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestao de compliance</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Documentacao, indicadores e conformidade trabalhista sob nossa responsabilidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] rounded-3xl px-8 py-12 text-white text-center lg:text-left lg:flex lg:items-center lg:justify-between gap-10">
            <div>
              <h2 className="text-3xl font-bold mb-4">Pronto para transformar a gestao de servicos?</h2>
              <p className="text-lg text-white/90 max-w-2xl">
                Fale conosco e descubra como a JSP pode assumir a operacao com eficiencia, seguranca e resultados
                mensuraveis para o seu negocio.
              </p>
            </div>
            <a
              href="https://wa.me/SEUNUMEROAQUI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 justify-center px-8 py-4 mt-6 lg:mt-0 text-lg font-semibold bg-white text-[#1e3a8a] rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <WhatsappIcon className="w-5 h-5 text-[#25D366]" />
              Falar com a JSP
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
