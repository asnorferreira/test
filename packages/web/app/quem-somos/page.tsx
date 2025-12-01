import { Shield, Users2, Lightbulb, Handshake } from "lucide-react"

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

const coreStatements = [
  {
    title: "Missão",
    description:
      "Garantir a excelência na prestação de serviços de facilities e segurança, antecipando necessidades e superando indicadores.",
  },
  {
    title: "Visão",
    description:
      "Ser reconhecida como parceira estratégica que transforma a gestão terceirizada em valor, confiança e segurança para cada cliente.",
  },
]

const purposeStatement =
  "Contribuir para ambientes de trabalho mais seguros, eficientes e sustentáveis, cuidando das pessoas e dos ativos de cada cliente."

export default function QuemSomosPage() {
  return (
    <main className="min-h-screen bg-white pt-32">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] py-20 text-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Quem Somos</p>
          </div>
        </div>
      </section>

      {/* Missão, Visão, Valores e Propósito */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreStatements.map((statement) => (
              <article
                key={statement.title}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">{statement.title}</p>
                <h3 className="mt-4 text-2xl font-bold text-gray-900">{statement.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{statement.description}</p>
              </article>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Valores</p>
                <h3 className="text-3xl font-bold text-gray-900">Como atuamos</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value) => (
                <article key={value.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center">
                    <value.icon className="w-5 h-5" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-gray-900">{value.title}</h4>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Propósito</p>
            <h3 className="mt-4 text-3xl font-bold text-gray-900">O que nos move</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">{purposeStatement}</p>
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
                Atuamos no mercado há 14 anos, com profissionais comprometidos e capacitados para prestação de serviços. Buscamos fidelizar 
                nosso clientes oferecendo serviços de qualidade e entregando resultados com excelência. 
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
              href="/contato"
              className="inline-flex items-center justify-center px-8 py-4 mt-6 lg:mt-0 text-lg font-semibold bg-white text-[#1e3a8a] rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              Falar com a JSP
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
