import { Button } from "@/app/web/components/ui/button"
import { Card } from "@/app/web/components/ui/card"
import { Building2, CheckCircle2, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

const clients = [
  {
    id: "prefeitura-recife",
    name: "Prefeitura do Recife",
    description:
      "Parceria estratégica com a Prefeitura do Recife, fornecendo serviços de qualidade para diversos setores municipais.",
    image: "/recife-city-skyline-sunset.jpg",
    sector: "Setor Público",
    services: ["Administrativo", "Limpeza", "Serviços Gerais"],
    since: "2015",
  },
  {
    id: "governo-pernambuco",
    name: "Governo de Pernambuco",
    description:
      "Colaboração com o Estado de Pernambuco através do programa Recife Bom de Buco, promovendo desenvolvimento social.",
    image: "/government-building-architecture.jpg",
    sector: "Setor Público",
    services: ["Administrativo", "Arquitetura e Engenharia", "Transporte"],
    since: "2016",
  },
  {
    id: "prefeitura-paulista",
    name: "Prefeitura Paulista",
    description:
      "Serviços integrados para a Prefeitura Municipal Paulista, contribuindo para a excelência na gestão pública.",
    image: "/modern-city-hall-building.jpg",
    sector: "Setor Público",
    services: ["Limpeza", "Serviços Gerais", "Manutenção"],
    since: "2018",
  },
  {
    id: "shopping-guararapes",
    name: "Shopping Guararapes",
    description: "Parceria no setor Shopping Guararapes, oferecendo serviços especializados.",
    image: "/modern-mall-interior.png",
    sector: "Varejo",
    services: ["Limpeza", "Segurança", "Manutenção"],
    since: "2019",
  },
]

export default function ClientesPage() {
  return (
    <main className="min-h-screen bg-white pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <p className="text-sm font-semibold mb-4">NOSSOS CLIENTES</p>
            <h1 className="text-5xl font-bold mb-6">Se você atende pessoas, nós atendemos você.</h1>
            <p className="text-xl leading-relaxed">
              Criamos experiências que importam onde quer que as pessoas trabalhem, aprendam, se recuperem e se
              divirtam.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1e3a8a] mb-2">50+</div>
              <div className="text-gray-600">Clientes Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1e3a8a] mb-2">10+</div>
              <div className="text-gray-600">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1e3a8a] mb-2">5000+</div>
              <div className="text-gray-600">Colaboradores</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1e3a8a] mb-2">100%</div>
              <div className="text-gray-600">Conformidade CLT</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossos Parceiros</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Trabalhamos com organizações líderes em diversos setores, oferecendo soluções personalizadas e
              excelência em serviços.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {clients.map((client) => (
              <Card key={client.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={client.image || "/placeholder.svg"}
                    alt={client.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">Cliente desde {client.since}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{client.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Serviços Prestados:</p>
                    <div className="flex flex-wrap gap-2">
                      {client.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 bg-blue-50 text-[#1e3a8a] text-sm rounded-full font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link href={`/clientes/${client.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white bg-transparent"
                    >
                      VER CASE COMPLETO →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que Somos a Escolha Certa?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Qualidade Garantida</h3>
              <p className="text-gray-600 leading-relaxed">
                Equipe qualificada e treinada, seguindo as normas da CLT e atendendo em diversas áreas de atuação.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Equipe Especializada</h3>
              <p className="text-gray-600 leading-relaxed">
                Profissionais capacitados para se tornarem os melhores que podem ser, alcançando o extraordinário.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resultados Comprovados</h3>
              <p className="text-gray-600 leading-relaxed">
                Mais de 10 anos de experiência entregando soluções eficientes que aumentam a produtividade.
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>
  )
}
