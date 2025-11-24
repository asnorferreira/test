"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUpRight,
  BarChart3,
  ChartLine,
  Copy,
  Gift,
  LinkIcon,
  Mail,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react"
import Link from "next/link"

const affiliateProfile = {
  name: "João Viana",
  email: "joao.viana@expertbet.io",
  code: "AFF_JOAO",
  tier: "Afiliado Expert",
  avatar: "JV",
  meta: 500,
  current: 360,
  status: "Meta em andamento",
}

const overviewStats = [
  { label: "Saldo atual", value: "R$ 2.340", helper: "Disponível para saque" },
  { label: "Comissões pendentes", value: "R$ 860", helper: "Liberação em 5 dias" },
  { label: "Histórico (30 dias)", value: "R$ 3.180", helper: "Último pagamento 05/10" },
  { label: "Status pagamento", value: "Em processamento", helper: "Liquidação 12/10" },
]

const periodTabs = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
]

const referralData = {
  links: [
    { label: "Link principal", url: "https://app.opta.com/r/AFF_JOAO", cliques: 2840, conversoes: 98, plano: "Start" },
    {
      label: "Campanha reels",
      url: "https://app.opta.com/r/AFF_JOAO_REELS",
      cliques: 1620,
      conversoes: 42,
      plano: "Expert",
    },
  ],
  indicadores: [
    { label: "Cliques totais", value: "6.480" },
    { label: "Conversões", value: "248" },
    { label: "Assinaturas ativas", value: "162", helper: "Start 90 • Profissional 48 • Trial 24" },
    { label: "Taxa de conversão", value: "3,8%" },
  ],
}

const marketingMaterials = [
  {
    title: "Banners sociais",
    items: ["Stories 1080x1920", "Feed 1080x1080", "Capa YouTube 2560x1440"],
  },
  {
    title: "Copys prontas",
    items: [
      "Texto para postagem com CTA de faturamento",
      "Script de reels comparando planos",
      "Email pronto para leads frios",
    ],
  },
  {
    title: "Dicas de conversão",
    items: [
      "Case: afiliado que atingiu R$ 8k focando em liga local",
      "Checklist de remarketing com cupom",
      "Guia de live tática com call-to-action",
    ],
  },
]

const relationshipTools = [
  { label: "Cupom personalizado", value: "AFF_JOAO", helper: "10% de desconto e comissão de 15%" },
  { label: "Mensagens diretas", value: "Chat aberto", helper: "Resposta médio 2h" },
  { label: "Ranking afiliados", value: "#05", helper: "Top conversões da semana" },
]

const financeExtract = [
  { date: "11/10", description: "Conversão Plano Start - Lucas R.", amount: "R$ 45,00", status: "Confirmado" },
  { date: "10/10", description: "Conversão Plano Expert - Marina F.", amount: "R$ 120,00", status: "Pendente" },
  { date: "07/10", description: "Comissão Trial - Marcelo P.", amount: "R$ 15,00", status: "Liquidado" },
]

const financeRules = [
  "Mínimo para saque: R$ 250 com confirmação em até 5 dias úteis.",
  "Pagamentos em Pix, transferência ou carteira digital Opta Wallet.",
  "Taxa de administração de 2% sobre comissões premium.",
]

const financialOptions = [
  { label: "Pix cadastrado", value: "Banco NU • ***-9123", action: "Alterar" },
  { label: "Carteira digital", value: "Saldo: R$ 430", action: "Transferir" },
  { label: "Transferência bancária", value: "Conta final 1023", action: "Detalhes" },
]

const insightsData = [
  { label: "Instagram", performance: "Conversão 4,1%", recommendation: "Mantenha CTA com cupom" },
  { label: "TikTok", performance: "Conversão 2,9%", recommendation: "Use vídeo comparando planos" },
  { label: "YouTube", performance: "Conversão 5,4%", recommendation: "Aproveite cortes de lives táticas" },
]

const insightsActions = [
  {
    title: "Clques altos, conversão baixa",
    detail: "Recomendo trocar o link principal pelo cupom AFF_JOAO para garantir desconto imediato.",
  },
  {
    title: "Meta de ganhos do mês",
    detail: "Você está a R$ 140 da meta de R$ 500. Sugestão: ativar campanha Expert para finalizar nesta semana.",
  },
  {
    title: "Previsão de ganhos 30 dias",
    detail: "Se mantiver a média atual, projeção de R$ 610 para novembro.",
  },
]

export default function AffiliatePanelPage() {
  const progressPercent = Math.min(Math.round((affiliateProfile.current / affiliateProfile.meta) * 100), 100)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Painel do afiliado</Badge>
              <h1 className="mt-3 text-3xl font-bold text-white">Central de indicações</h1>
              <p className="text-white/60 text-sm">
                Acompanhe cliques, comissões, materiais e conselhos inteligentes para potencializar suas vendas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-white/70 text-xs">
              <span>{affiliateProfile.name}</span>
              <span>•</span>
              <span>{affiliateProfile.tier}</span>
              <span>•</span>
              <span>{affiliateProfile.status}</span>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 bg-[#05070d] border border-[#1f2935]">
              <TabsTrigger value="overview" className="text-white">
                Visão geral
              </TabsTrigger>
              <TabsTrigger value="indicacoes" className="text-white">
                Indicações
              </TabsTrigger>
              <TabsTrigger value="materiais" className="text-white">
                Materiais
              </TabsTrigger>
              <TabsTrigger value="relacionamento" className="text-white">
                Relacionamento
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="text-white">
                Área financeira
              </TabsTrigger>
              <TabsTrigger value="insights" className="text-white">
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-[#1f2935]">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {affiliateProfile.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-2xl">{affiliateProfile.name}</CardTitle>
                      <CardDescription className="text-white/60">Código {affiliateProfile.code}</CardDescription>
                      <p className="text-white/50 text-xs">{affiliateProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{affiliateProfile.tier}</Badge>
                    <Badge className="bg-[#0a101a] text-white/80 border border-[#1f2935]">{affiliateProfile.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {overviewStats.map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                        <p className="text-white/60 text-xs uppercase tracking-wide">{stat.label}</p>
                        <p className="text-white text-2xl font-semibold mt-1">{stat.value}</p>
                        <p className="text-white/50 text-xs mt-1">{stat.helper}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Meta gamificada</p>
                        <p className="text-white font-semibold">
                          R$ {affiliateProfile.current} / R$ {affiliateProfile.meta}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 text-white border-[#1f2935]">
                        <Trophy className="w-4 h-4" />
                        Ajustar meta
                      </Button>
                    </div>
                    <Progress value={progressPercent} className="h-2 bg-[#101726]" />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Progresso</span>
                      <span>{progressPercent}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Histórico de ganhos</Badge>
                  <CardTitle className="text-white text-xl">Visualize por período</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="month" className="space-y-4">
                    <TabsList className="flex flex-wrap gap-2 bg-[#05070d] border border-[#1f2935] w-fit">
                      {periodTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="text-white">
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="day" className="text-white/70 text-sm">
                      R$ 180 em ganhos confirmados nas últimas 24h. 6 conversões, 2 pendentes de validação.
                    </TabsContent>
                    <TabsContent value="week" className="text-white/70 text-sm">
                      R$ 920 na última semana, com destaque para afiliados vindos de Instagram Ads.
                    </TabsContent>
                    <TabsContent value="month" className="text-white/70 text-sm">
                      R$ 3.180 no mês. Pico em 08/10 após campanha com cupom AFF_JOAO e série de lives táticas.
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="indicacoes" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Links e métricas</Badge>
                  <CardTitle className="text-white text-xl">Acompanhamento de indicações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {referralData.links.map((link) => (
                    <div
                      key={link.url}
                      className="flex flex-col gap-3 rounded-lg border border-[#1f2935] bg-[#05070d] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-white font-semibold">{link.label}</p>
                        <p className="text-white/70 text-xs">{link.url}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-white/70 text-xs">
                        <span>Cliques {link.cliques}</span>
                        <span>Conversões {link.conversoes}</span>
                        <span>Plano destaque {link.plano}</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 text-white border-[#1f2935]">
                        <Copy className="w-4 h-4" />
                        Copiar
                      </Button>
                    </div>
                  ))}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {referralData.indicadores.map((indicador) => (
                      <div key={indicador.label} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                        <p className="text-white/60 text-xs uppercase tracking-wide">{indicador.label}</p>
                        <p className="text-white text-2xl font-semibold mt-1">{indicador.value}</p>
                        {indicador.helper && <p className="text-white/50 text-xs mt-1">{indicador.helper}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materiais" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Biblioteca de marketing</Badge>
                  <CardTitle className="text-white text-xl">Materiais de divulgação</CardTitle>
                  <CardDescription className="text-white/70">
                    Descubra ativos visuais, copys e dicas de conversão com downloads imediatos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {marketingMaterials.map((material) => (
                    <div key={material.title} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold text-sm">{material.title}</p>
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <ul className="list-disc list-inside text-white/70 text-xs space-y-1">
                        {material.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="gap-2 text-white border-[#1f2935] w-full">
                        <DownloadIcon />
                        Download
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relacionamento" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Ferramentas do afiliado</Badge>
                  <CardTitle className="text-white text-xl">Facilite relacionamentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {relationshipTools.map((tool) => (
                      <div key={tool.label} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                        <p className="text-white font-semibold">{tool.label}</p>
                        <p className="text-white/70 text-sm mt-1">{tool.value}</p>
                        <p className="text-white/60 text-xs mt-2">{tool.helper}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">Leaderboard semanal</p>
                        <p className="text-white/60 text-xs">Top afiliados por conversões</p>
                      </div>
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="grid gap-2 md:grid-cols-3 text-xs text-white/70">
                      <span>#01 • Maria Tavares</span>
                      <span>#02 • Caio Rios</span>
                      <span>#03 • Ana Souza</span>
                      <span>#04 • Breno Castro</span>
                      <span>#05 • João Viana (você)</span>
                      <span>#06 • Lucas Braga</span>
                    </div>
                    <Button variant="outline" size="sm" className="self-start gap-2 text-white border-[#1f2935]">
                      <Mail className="w-4 h-4" />
                      Abrir mensagens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Extrato</Badge>
                  <CardTitle className="text-white text-xl">Movimentações recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {financeExtract.map((item) => (
                    <div
                      key={`${item.date}-${item.description}`}
                      className="flex flex-col gap-1 rounded-lg border border-[#1f2935] bg-[#05070d] p-4 text-sm text-white/80"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{item.description}</p>
                        <span className="text-primary">{item.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>{item.date}</span>
                        <Badge className="bg-[#0a101a] text-white/70 border border-[#1f2935]">{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Regras e saques</Badge>
                  <CardTitle className="text-white text-xl">Condições de pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                    {financeRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                  <div className="grid gap-3 md:grid-cols-3">
                    {financialOptions.map((option) => (
                      <div key={option.label} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold text-sm">{option.label}</p>
                          <Button variant="link" className="p-0 text-primary text-xs">
                            {option.action}
                          </Button>
                        </div>
                        <p className="text-white/70 text-xs">{option.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2">
                      <Wallet className="w-4 h-4" />
                      Solicitar saque
                    </Button>
                    <Button variant="outline" className="gap-2 text-white border-[#1f2935]">
                      <LinkIcon className="w-4 h-4" />
                      Gerenciar contas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Performance</Badge>
                  <CardTitle className="text-white text-xl">Insights por canal</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {insightsData.map((insight) => (
                    <div key={insight.label} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold">{insight.label}</p>
                        <ChartLine className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-white/70 text-xs mt-1">{insight.performance}</p>
                      <p className="text-white/60 text-xs mt-2">{insight.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Recomendações</Badge>
                  <CardTitle className="text-white text-xl">Ações sugeridas pelo sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insightsActions.map((action) => (
                    <div
                      key={action.title}
                      className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex items-start gap-3 text-sm text-white/80"
                    >
                      <TrendingUp className="w-4 h-4 text-primary mt-1" />
                      <div>
                        <p className="text-white font-semibold">{action.title}</p>
                        <p className="text-white/60 text-xs mt-1">{action.detail}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      Aplicar recomendações
                    </Button>
                    <Button variant="outline" className="gap-2 text-white border-[#1f2935]">
                      <Gift className="w-4 h-4" />
                      Criar nova campanha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="text-white">
                Voltar ao dashboard
              </Button>
            </Link>
            <Link href="/dashboard/planos">
              <Button className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Gerenciar upgrades
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

function DownloadIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 21h14" />
    </svg>
}
