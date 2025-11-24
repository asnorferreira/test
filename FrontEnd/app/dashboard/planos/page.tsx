"use client"

import { useState } from "react"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Crown, RefreshCcw, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

const planOptions = [
  {
    id: "essencial",
    title: "Plano Essencial",
    price: "R$ 19/mês",
    badge: "Ideal para iniciantes",
    features: ["Indicadores básicos das principais ligas", "Alertas de partidas em destaque", "Exportação CSV mensal"],
  },
  {
    id: "profissional",
    title: "Plano Profissional",
    price: "R$ 29/mês",
    badge: "Mais escolhido",
    features: [
      "Tudo do Essencial",
      "Probabilidades em tempo real e mapas de calor",
      "Exportação ilimitada e dashboards personalizáveis",
    ],
    highlight: true,
  },
  {
    id: "elite",
    title: "Plano Elite",
    price: "R$ 59/mês",
    badge: "Times avançados",
    features: [
      "Suporte dedicado 24/7 e squad de onboarding",
      "Integração via API com atualizações em streaming",
      "Relatórios executivos automatizados e playbooks",
    ],
  },
]

const addOns = [
  {
    id: "visual-insights",
    title: "Pacote Visual Insights",
    description: "Collection de dashboards prontos e modelos para diretoria técnica.",
    price: "+ R$ 12/mês",
  },
  {
    id: "alerts",
    title: "Alertas Personalizados Plus",
    description: "Expanda limites para até 50 alertas inteligentes simultâneos.",
    price: "+ R$ 7/mês",
  },
  {
    id: "api-quota",
    title: "API Extra Analytics",
    description: "Duplicação da cota de requisições para integrações externas.",
    price: "+ R$ 19/mês",
  },
]

const currentUsage = {
  planId: "profissional",
  renewalDate: "12 de outubro de 2025",
  seatsUsed: 3,
  seatsAvailable: 5,
  dashboards: 6,
  alerts: 12,
}

export default function ManagePlanPage() {
  const [selectedPlan, setSelectedPlan] = useState(currentUsage.planId)

  const seatPercent = Math.round((currentUsage.seatsUsed / currentUsage.seatsAvailable) * 100)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Gestão de planos</Badge>
              <h1 className="mt-3 text-3xl font-bold text-white">Escolha e personalize seu plano</h1>
              <p className="text-white/60 text-sm">
                Compare opções, acompanhe consumo e confirme atualizações de assinatura
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="text-white">
                  Voltar ao dashboard
                </Button>
              </Link>
              <Button className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Atualizar plano
              </Button>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-3">
            {planOptions.map((plan) => (
              <Card
                key={plan.id}
                className={`bg-[#0a101a] border ${
                  plan.highlight || plan.id === selectedPlan ? "border-primary" : "border-[#1f2935]"
                }`}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      {plan.highlight && <Crown className="h-4 w-4 text-primary" />}
                      {plan.title}
                    </CardTitle>
                    {plan.badge && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{plan.badge}</Badge>
                    )}
                  </div>
                  <CardDescription className="text-white/80">{plan.price}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-1" />
                        <p className="text-white/80 text-sm">{feature}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={plan.id === selectedPlan ? "default" : "outline"}
                    className="w-full gap-2"
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.id === selectedPlan ? "Plano selecionado" : "Selecionar plano"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-[#0a101a] border-[#1f2935]">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Uso atual</Badge>
                <CardTitle className="text-white text-xl">Consumo por squad</CardTitle>
                <CardDescription className="text-white/70">
                  Mantenha o monitoramento do uso para evitar limitações nos dias de rodada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>
                      {currentUsage.seatsUsed} de {currentUsage.seatsAvailable} acessos
                    </span>
                    <span>{seatPercent}%</span>
                  </div>
                  <Progress value={seatPercent} className="mt-2 h-2 bg-[#151c26]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <UsageStat label="Dashboards personalizados" value={`${currentUsage.dashboards}`} />
                  <UsageStat label="Alertas inteligentes ativos" value={`${currentUsage.alerts}`} />
                  <UsageStat label="Plano selecionado" value={planOptions.find((p) => p.id === selectedPlan)?.title} />
                  <UsageStat label="Próxima renovação" value={currentUsage.renewalDate} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a101a] border-[#1f2935]">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Complementos</Badge>
                <CardTitle className="text-white text-xl">Adicione recursos extras</CardTitle>
                <CardDescription className="text-white/70">
                  Ative add-ons para expandir limites e liberar assistências avançadas para o time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue={addOns[0].id}>
                  <TabsList className="flex flex-wrap gap-2 bg-[#05070d] border border-[#1f2935]">
                    {addOns.map((addon) => (
                      <TabsTrigger key={addon.id} value={addon.id} className="text-white">
                        {addon.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {addOns.map((addon) => (
                    <TabsContent key={addon.id} value={addon.id} className="space-y-3">
                      <p className="text-white/80 text-sm">{addon.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20">{addon.price}</Badge>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Zap className="h-4 w-4" />
                          Adicionar complemento
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </section>

          <Card className="bg-[#0a101a] border-[#1f2935]">
            <CardHeader>
              <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Resumo</Badge>
              <CardTitle className="text-white text-xl">Confirmação de alteração</CardTitle>
              <CardDescription className="text-white/70">
                Confira os detalhes antes de confirmar a atualização do seu plano.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <UsageStat label="Novo plano" value={planOptions.find((p) => p.id === selectedPlan)?.title} />
                <UsageStat label="Faturamento mensal estimado" value="R$ 29,00" />
                <UsageStat label="Novos complementos" value="Visual Insights, Alertas Plus" />
                <UsageStat label="Aplicação" value="Imediata após confirmação" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Confirmar atualização
                </Button>
                <Button variant="outline" className="text-white">
                  Salvar para depois
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}

interface UsageStatProps {
  label: string
  value?: string
}

function UsageStat({ label, value }: UsageStatProps) {
  return (
    <div className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="text-white font-semibold">{value ?? "-"}</p>
    </div>
  )
}
