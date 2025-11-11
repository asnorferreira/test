import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que Terceirizar com a JSP?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Oferecemos soluções completas que aumentam a eficiência e reduzem custos operacionais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Redução de Custos</h3>
              <p className="text-gray-600 leading-relaxed">
                Reduza custos operacionais em até 30% com nossa gestão eficiente e especializada.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Equipe Qualificada</h3>
              <p className="text-gray-600 leading-relaxed">
                Profissionais treinados e capacitados, prontos para atender suas necessidades específicas.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Conformidade Legal</h3>
              <p className="text-gray-600 leading-relaxed">
                100% de conformidade com a CLT e todas as normas trabalhistas vigentes.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Atendimento 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Suporte contínuo e atendimento disponível a qualquer momento que você precisar.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Relatórios Periódicos</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe o desempenho com relatórios detalhados e transparentes.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-[#1e3a8a] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gestão de Qualidade</h3>
              <p className="text-gray-600 leading-relaxed">
                Processos certificados e controle rigoroso de qualidade em todos os serviços.
              </p>
            </Card>
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
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contato Inicial</h3>
              <p className="text-gray-600">Preencha o formulário e nos conte sobre suas necessidades</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Análise Detalhada</h3>
              <p className="text-gray-600">Nossa equipe analisa suas necessidades e elabora uma solução</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proposta Personalizada</h3>
              <p className="text-gray-600">Receba uma proposta detalhada e customizada</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Implementação</h3>
              <p className="text-gray-600">Iniciamos os serviços com total suporte e acompanhamento</p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Solicite sua Proposta</h2>
              <p className="text-lg text-gray-600">
                Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas
              </p>
            </div>

            <Card className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <Input placeholder="Seu nome" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cargo *</label>
                    <Input placeholder="Seu cargo na empresa" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail Corporativo *</label>
                    <Input type="email" placeholder="seu@empresa.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                    <Input placeholder="(00) 00000-0000" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
                    <Input placeholder="Nome da empresa" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Setor de Atuação *</label>
                    <Input placeholder="Ex: Saúde, Educação, Varejo" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serviços de Interesse *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      "Administrativo",
                      "Limpeza e Conservação",
                      "Serviços Gerais",
                      "Saúde",
                      "Transporte e Logística",
                      "Outros",
                    ].map((service) => (
                      <label key={service} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número Estimado de Profissionais
                  </label>
                  <Input placeholder="Ex: 10, 50, 100+" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descreva suas Necessidades *</label>
                  <Textarea placeholder="Conte-nos mais sobre o que você precisa..." rows={6} required />
                </div>

                <Button className="w-full bg-[#1e3a8a] hover:bg-[#2563eb] text-white py-6 text-lg">
                  Solicitar Proposta
                </Button>

                <p className="text-sm text-gray-500 text-center">
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
