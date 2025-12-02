import { CheckCircle2 } from "lucide-react"
import { Card } from "@/app/web/components/ui/card"

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
    <section id="why-us" className="bg-gradient-to-b from-white via-white to-[#e0e7ff] py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-14 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1e3a8a]">Por que nos contratar?</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-blue-900 md:text-4xl">
            Terceirizar para crescer: nosso compromisso é entregar qualidade, eficiência e soluções com impacto real
            ao seu negócio.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Conectamos pessoas, processos e tecnologia para que você possa focar no que importa enquanto cuidamos da
            operação com excelência, transparência e indicadores claros.
          </p>
        </div>

        <div className="rounded-[36px] border border-slate-100 bg-white/80 p-8 shadow-[0_20px_65px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <Card className="rounded-3xl border border-slate-200 bg-[#f8fafc]/80 p-8 shadow-lg md:p-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.6em] text-[#1e3a8a]">
                      Parceiro estratégico
                    </p>
                    <h3 className="text-3xl font-semibold text-[#0f172a]">
                      Segurança operacional, agilidade e proximidade para o seu negócio
                    </h3>
                    <p className="text-base leading-relaxed text-gray-600">
                      Em 14 anos de atuação, construímos operações consistentes em facilities e mão de obra especializada,
                      garantindo previsibilidade, compliance e resultados mensuráveis para cada cliente que confia na JSP.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a]">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-medium text-gray-700">{benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="rounded-3xl border border-transparent bg-gradient-to-br from-[#1e3a8a] to-[#1d4ed8] p-8 text-white shadow-xl">
                <h3 className="text-2xl font-semibold">Foco no seu negócio</h3>
                <p className="mt-3 text-base leading-relaxed text-white/90">
                  Terceirizar mão de obra é uma excelente estratégia para aumentar sua produtividade, direcionando seus
                  esforços para áreas estratégicas. A JSP conta com equipes qualificadas e suporte completo para entregar
                  operação eficiente, redução de custos e maior governança.
                </p>
              </Card>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <img
                src="https://electiservicos.com.br/wp-content/uploads/2020/08/Por-que-contratar-uma-empresa-de-RH-para-fazer-o-recrutamento-e-sele%C3%A7%C3%A3o-1-1024x683.jpg"
                alt="Industrial facility"
                className="h-[320px] w-full rounded-[32px] object-cover shadow-[0_30px_40px_rgba(15,23,42,0.25)]"
              />
              <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-6 rounded-2xl border border-slate-200 bg-white px-8 py-4 shadow-xl">
                <div className="text-center">
                  <span className="text-3xl font-bold text-[#1e3a8a]">10+</span>
                  <p className="text-xs font-medium text-gray-600">Anos de experiência</p>
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
      </div>
    </section>
  )
}
