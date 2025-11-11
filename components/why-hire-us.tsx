import { CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"

const benefits = [
  "Equipe qualificada e treinada",
  "Atendimento 24/7",
  "Tecnologia de gestão",
  "Conformidade regulatória",
  "Sustentabilidade",
  "Relatórios periódicos",
]

export function WhyHireUs() {
  return (
    <section className="bg-gradient-to-b from-white via-white to-[#f1f5f9] py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <p className="text-sm font-semibold text-[#1e3a8a]">Por que nos contratar?</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            Nosso compromisso é entregar qualidade, eficiência e soluções que fazem a diferença para o seu negócio.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Terceirizar com a JSP é contar com profissionais capacitados, administrados e registrados por nós, seguindo as
            normas da Consolidação das Leis Trabalhistas (C.L.T) e atuando em diversas áreas.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <Card className="rounded-3xl border-none bg-white p-8 shadow-xl md:p-10">
              <h3 className="text-3xl font-semibold text-[#1e3a8a]">Parceiro estratégico para o sucesso do seu negócio</h3>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                Somos especialistas em gestão de facilities e terceirização de mão de obra, com anos de experiência no
                mercado. Nossa missão é proporcionar soluções eficientes que aumentam a produtividade e reduzem custos
                operacionais.
              </p>
              <div className="mt-8 grid gap-y-4 gap-x-6 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#e5edff]">
                      <CheckCircle2 className="h-4 w-4 text-[#1e3a8a]" />
                    </span>
                    <span className="text-sm font-medium text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-none bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] p-8 text-white shadow-xl">
              <h3 className="text-2xl font-semibold">Foco no seu negócio</h3>
              <p className="mt-3 text-base leading-relaxed text-white/90">
                Terceirizar mão de obra é uma excelente estratégia para aumentar sua produtividade, direcionando seus
                esforços para atividades e áreas estratégicas. A JSP conta com equipes qualificadas e todo o material de
                apoio necessário para uma prestação de serviços eficiente, resultando na redução de custos operacionais e
                maior controle do seu negócio.
              </p>
            </Card>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <img
              src="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80"
              alt="Industrial facility"
              className="h-[310px] w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-6 rounded-2xl border border-slate-200 bg-white px-8 py-4 shadow-xl">
              <div className="text-center">
                <span className="text-3xl font-bold text-[#1e3a8a]">10+</span>
                <p className="text-xs font-medium text-gray-600">Anos de Experiência</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div className="text-center">
                <span className="text-3xl font-bold text-[#1e3a8a]">100%</span>
                <p className="text-xs font-medium text-gray-600">Conformidade CLT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
