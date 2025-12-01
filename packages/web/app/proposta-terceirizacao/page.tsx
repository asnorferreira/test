import { Button } from "@/packages/web/components/ui/button"
import { Input } from "@/packages/web/components/ui/input"
import { Textarea } from "@/packages/web/components/ui/textarea"
import { Card } from "@/packages/web/components/ui/card"
import { CheckCircle2, FileText, Users, TrendingUp, Shield, Clock } from "lucide-react"

export default function PropostaTerceirizacaoPage() {
  return (
    <main className="min-h-screen bg-white pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Proposta de Terceirização</h1>
            <p className="text-xl leading-relaxed">
              Soluções personalizadas para sua empresa. Solicite uma proposta sem compromisso e descubra como podemos
              otimizar seus processos.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="why-us" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que Terceirizar com a JSP?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Oferecemos soluções completas que aumentam a eficiência e reduzem custos operacionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[{ icon: TrendingUp, title: "Redução de Custos", text: "Reduza custos operacionais em até 30% com nossa gestão eficiente e especializada." },
              { icon: Users, title: "Equipe Qualificada", text: "Profissionais treinados e capacitados, prontos para atender suas necessidades específicas." },
              { icon: Shield, title: "Conformidade Legal", text: "100% de conformidade com a CLT e todas as normas trabalhistas vigentes." },
              { icon: Clock, title: "Atendimento 24/7", text: "Suporte contínuo e atendimento disponível a qualquer momento que você precisar." },
              { icon: FileText, title: "Relatórios Periódicos", text: "Acompanhe o desempenho com relatórios detalhados e transparentes." },
              { icon: CheckCircle2, title: "Gestão de Qualidade", text: "Processos certificados e controle rigoroso de qualidade em todos os serviços." },
            ].map((card) => (
              <Card key={card.title} className="p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg text-gray-600">Processo simples e transparente em 4 etapas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Contato Inicial", text: "Preencha o formulário e nos conte sobre suas necessidades." },
              { title: "Análise Detalhada", text: "Nossa equipe analisa suas necessidades e elabora uma solução." },
              { title: "Proposta Personalizada", text: "Receba uma proposta detalhada e customizada." },
              { title: "Implementação", text: "Iniciamos os serviços com total suporte e acompanhamento." },
            ].map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section className="py-24 bg-gradient-to-br from-[#f7f8fc] via-white to-[#e0e7ff]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Solicite sua Proposta</h2>
              <p className="text-lg text-gray-600">
                Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas úteis.
              </p>
            </div>

            <Card className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_30px_65px_rgba(15,23,42,0.08)]">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Nome Completo *
                    <Input placeholder="Seu nome" required />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Cargo *
                    <Input placeholder="Seu cargo na empresa" required />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    E-mail Corporativo *
                    <Input type="email" placeholder="seu@empresa.com" required />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Telefone *
                    <Input placeholder="(00) 00000-0000" required />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Nome da Empresa *
                    <Input placeholder="Nome da empresa" required />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Setor de Atuação *
                    <Input placeholder="Ex: Arquitetura e Engenharia, Facilities, Varejo" required />
                  </label>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Serviços de Interesse *</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "Administrativo",
                      "Limpeza e Conservação",
                      "Serviços Gerais",
                      "Arquitetura e Engenharia",
                      "Transporte e Logística",
                      "Outros",
                    ].map((service) => (
                      <label
                        key={service}
                        className="flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:border-[#1e3a8a]"
                      >
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                        {service}
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Número Estimado de Profissionais
                  <Input placeholder="Ex: 10, 50, 100+" />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                  Descreva suas Necessidades *
                  <Textarea placeholder="Conte-nos mais sobre o que você precisa..." rows={6} required />
                </label>

                <Button className="w-full rounded-full bg-[#1e3a8a] py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-[#1d4ed8]">
                  Solicitar Proposta
                </Button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Ao enviar este formulário, você concorda com nossa Política de Privacidade
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
