import { Button } from "@/components/ui/button"
import { CheckCircle2, Building2, Users, Calendar } from "lucide-react"
import Link from "next/link"

const clientData: Record<string, any> = {
  "prefeitura-recife": {
    name: "Prefeitura do Recife",
    sector: "Setor Público",
    since: "2015",
    image: "/recife-city-skyline-sunset.jpg",
    description:
      "A Prefeitura do Recife é um dos nossos principais parceiros, com quem mantemos uma relação de confiança e excelência há mais de 8 anos.",
    challenge:
      "A Prefeitura do Recife necessitava de uma solução completa de terceirização que pudesse atender diversos setores municipais com eficiência, qualidade e conformidade total com a legislação trabalhista.",
    solution:
      "Implementamos uma equipe multidisciplinar de profissionais qualificados, incluindo serviços administrativos, de limpeza e conservação, e serviços gerais. Nossa solução incluiu treinamento contínuo, gestão de qualidade e relatórios periódicos de desempenho.",
    results: [
      "Redução de 30% nos custos operacionais",
      "Aumento de 95% na satisfação dos usuários dos serviços públicos",
      "100% de conformidade com a CLT",
      "Equipe de 500+ profissionais alocados",
    ],
    services: ["Administrativo", "Limpeza e Conservação", "Serviços Gerais", "Manutenção Predial"],
    testimonial: {
      text: "A JSP transformou a forma como gerenciamos nossos serviços terceirizados. A qualidade e o profissionalismo da equipe são excepcionais.",
      author: "Secretário Municipal",
      role: "Prefeitura do Recife",
    },
  },
  "governo-pernambuco": {
    name: "Governo de Pernambuco",
    sector: "Setor Público",
    since: "2016",
    image: "/government-building-architecture.jpg",
    description:
      "Parceria estratégica com o Governo do Estado de Pernambuco, contribuindo para o desenvolvimento social através do programa Recife Bom de Buco.",
    challenge:
      "O Governo de Pernambuco buscava um parceiro confiável para fornecer serviços integrados em diversas secretarias estaduais, com foco em qualidade e desenvolvimento social.",
    solution:
      "Desenvolvemos um programa customizado de terceirização que incluiu não apenas a alocação de profissionais qualificados, mas também iniciativas de capacitação e desenvolvimento profissional alinhadas com os objetivos sociais do estado.",
    results: [
      "Mais de 800 profissionais alocados",
      "Programa de capacitação beneficiou 1000+ pessoas",
      "Redução de 25% no tempo de resposta dos serviços",
      "Certificação de excelência em gestão pública",
    ],
    services: ["Administrativo", "Saúde", "Transporte e Logística", "Serviços Gerais"],
    testimonial: {
      text: "A JSP demonstrou compromisso não apenas com a qualidade dos serviços, mas também com o desenvolvimento social do nosso estado.",
      author: "Gestor Público",
      role: "Governo de Pernambuco",
    },
  },
  "prefeitura-paulista": {
    name: "Prefeitura Paulista",
    sector: "Setor Público",
    since: "2018",
    image: "/modern-city-hall-building.jpg",
    description:
      "Fornecemos serviços integrados para a Prefeitura Municipal de Paulista, contribuindo para a excelência na gestão pública municipal.",
    challenge:
      "A Prefeitura de Paulista precisava modernizar seus serviços terceirizados, buscando maior eficiência operacional e melhor atendimento à população.",
    solution:
      "Implementamos uma solução completa que incluiu modernização dos processos, tecnologia de gestão, equipe qualificada e sistema de monitoramento de qualidade em tempo real.",
    results: [
      "Melhoria de 40% na eficiência operacional",
      "Sistema de gestão digital implementado",
      "Equipe de 300+ profissionais treinados",
      "Redução de 35% em reclamações",
    ],
    services: ["Limpeza e Conservação", "Serviços Gerais", "Manutenção", "Jardinagem"],
    testimonial: {
      text: "A parceria com a JSP trouxe modernização e eficiência para nossos serviços municipais. Recomendamos fortemente.",
      author: "Prefeito",
      role: "Prefeitura Paulista",
    },
  },
  "shopping-guararapes": {
    name: "Shopping Guararapes",
    sector: "Varejo",
    since: "2019",
    image: "/modern-mall-interior.png",
    description:
      "Parceria estratégica no setor de varejo, oferecendo serviços especializados para manter o padrão de excelência do Shopping Guararapes.",
    challenge:
      "O Shopping Guararapes necessitava de serviços de alta qualidade que mantivessem o ambiente sempre impecável e seguro para milhares de visitantes diários.",
    solution:
      "Desenvolvemos um plano de serviços premium que incluiu equipes especializadas em limpeza, segurança e manutenção, com protocolos rigorosos de qualidade e atendimento 24/7.",
    results: [
      "Avaliação de 98% de satisfação dos lojistas",
      "Zero incidentes de segurança",
      "Ambiente sempre impecável",
      "Equipe de 150+ profissionais dedicados",
    ],
    services: ["Limpeza e Conservação", "Segurança Patrimonial", "Manutenção Predial", "Serviços Gerais"],
    testimonial: {
      text: "A JSP entende as necessidades do varejo de alto padrão. Seus serviços são impecáveis e a equipe é extremamente profissional.",
      author: "Gerente Geral",
      role: "Shopping Guararapes",
    },
  },
}

export function generateStaticParams() {
  return Object.keys(clientData).map((slug) => ({ slug }))
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ slug: string | string[] }>
}) {
  const resolvedParams = await params
  const slugParam = resolvedParams?.slug ?? ""
  const rawSlug = Array.isArray(slugParam) ? slugParam[0] : slugParam
  const normalizeSlug = (slug: string) =>
    decodeURIComponent(slug.replace(/\+/g, " "))
      .trim()
      .toLowerCase()
  const clientKey = rawSlug ? normalizeSlug(rawSlug) : ""
  const client =
    clientData[clientKey] ??
    Object.entries(clientData).find(([key]) => normalizeSlug(key) === clientKey)?.[1]

  if (!client) {
    return (
      <main className="min-h-screen bg-white pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Cliente não encontrado</h1>
          <Link href="/clientes">
            <Button>Voltar para Clientes</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white pt-32">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img src={client.image || "/placeholder.svg"} alt={client.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/90 to-[#2563eb]/70 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <p className="text-sm font-semibold mb-2">{client.sector}</p>
              <h1 className="text-5xl font-bold mb-4">{client.name}</h1>
              <p className="text-xl">{client.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Setor</div>
                <div className="font-bold text-gray-900">{client.sector}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Cliente desde</div>
                <div className="font-bold text-gray-900">{client.since}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Serviços</div>
                <div className="font-bold text-gray-900">{client.services.length} Categorias</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge & Solution */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">O Desafio</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{client.challenge}</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa Solução</h2>
              <p className="text-lg text-gray-600 leading-relaxed">{client.solution}</p>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] rounded-3xl p-12 text-white mb-16">
            <h2 className="text-3xl font-bold mb-8">Resultados Alcançados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.results.map((result: string, index: number) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
                  <p className="text-lg">{result}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services Provided */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Serviços Prestados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {client.services.map((service: string) => (
                <div key={service} className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="font-semibold text-gray-900">{service}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-2xl text-gray-900 mb-6 leading-relaxed italic">"{client.testimonial.text}"</p>
              <div>
                <p className="font-bold text-gray-900">{client.testimonial.author}</p>
                <p className="text-gray-600">{client.testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Quer resultados como estes?</h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos ajudar sua empresa a alcançar a excelência.
          </p>
          <Link href="/contato">
            <Button className="bg-white text-[#1e3a8a] hover:bg-gray-100 px-8 py-6 text-lg">
              Solicite um Orçamento
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
