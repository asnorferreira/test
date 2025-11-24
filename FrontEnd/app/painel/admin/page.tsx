"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertTriangle,
  FileDown,
  Gift,
  LineChart,
  MailCheck,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  Wallet,
} from "lucide-react"
import Link from "next/link"

const adminProfile = {
  name: "Eduardo Gomes",
  role: "Administrador Master",
  email: "eduardo.gomes@optaadmin.com",
  avatarInitials: "EG",
  lastAccess: "Último acesso há 4 minutos",
}

const dashboardMetrics = [
  { label: "Receita mensal", value: "R$ 142.500", trend: "+12% vs mês anterior" },
  { label: "Usuários ativos", value: "3.480", trend: "+8% vs semana" },
  { label: "Afiliados ativos", value: "420", trend: "+15 novas indicações" },
  { label: "Churn (30 dias)", value: "2,3%", trend: "-0,4pp" },
]

const adminSections = [
  {
    title: "Gestão de Usuários e Acessos",
    icon: Users,
    description:
      "Controle completo para cadastrar contas, alinhar permissões e monitorar limites do Scout Free vinculados ao CPF.",
    items: [
      "Cadastro e perfis: visualizar, editar e suspender contas",
      "Controle de permissões para clientes, afiliados e administradores",
      "Monitore o uso do Scout Free com limite de 1 jogo/rodada",
    ],
  },
  {
    title: "Gestão de Conteúdo e Produtos",
    icon: Upload,
    description:
      "Crie e atualize conteúdos táticos, rodadas, apostas sugeridas e notificações segmentadas com automação.",
    items: [
      "Ativar, pausar ou reajustar planos com promoções temporárias",
      "Cadastrar rodadas/jogos com estatísticas homologadas",
      "Gerenciar sugestões de apostas e liberar novas análises",
      "Disparar notificações e controlar trials manuais ou automáticos",
    ],
  },
  {
    title: "Inteligência e Métricas",
    icon: LineChart,
    description:
      "Monitore KPIs financeiros, conversões e performance dos insights gerados para clientes e afiliados.",
    items: [
      "Receita mensal, anual, churn, CAC e saúde financeira",
      "Afiliados e indicações com cliques, cadastros e comissões",
      "Conversões de planos Free, Start, Expert e ROI médio das apostas",
    ],
  },
  {
    title: "Ferramentas Extras",
    icon: ShieldCheck,
    description:
      "Eleve a governança com cupons, integrações de marketing, relatórios avançados e auditoria de logs.",
    items: [
      "Criar cupons de desconto para campanhas e afiliados",
      "Auditar logs do sistema e monitorar falhas de integração",
      "Exportar dados para Excel/PDF e integrar com CRM e e-mail marketing",
    ],
  },
]

const tabs = [
  { value: "overview", label: "Dashboard geral" },
  { value: "usuarios", label: "Gestão de usuários" },
  { value: "conteudo", label: "Conteúdo e produtos" },
  { value: "metricas", label: "Inteligência e KPIs" },
  { value: "extras", label: "Ferramentas extras" },
]

const planBreakdown = [
  { plan: "Free", users: 1280, revenue: "R$ 0", trends: "20 novos testes" },
  { plan: "Start", users: 980, revenue: "R$ 19,9K", trends: "+6% upgrades" },
  { plan: "Profissional", users: 720, revenue: "R$ 20,9K", trends: "+8% upsell" },
  { plan: "Expert", users: 320, revenue: "R$ 18,8K", trends: "+12 afiliados" },
  { plan: "Elite", users: 180, revenue: "R$ 35,9K", trends: "+3 squads enterprise" },
]

const contentReleases = [
  {
    title: "Rodada 32 - Premier League",
    status: "Publicado",
    stats: "18 jogos e 246 eventos cadastrados",
    owner: "Squad Conteúdo UK",
    schedule: "Atualizado hoje • 08h10",
  },
  {
    title: "Análises Expert - Libertadores",
    status: "Revisão final",
    stats: "12 relatórios táticos e 28 insights",
    owner: "Equipe Expert LATAM",
    schedule: "Entrega prevista 14h",
  },
  {
    title: "Promo Especial Start",
    status: "Ativo",
    stats: "Cupom START10 até 15/10",
    owner: "Growth Mkt",
    schedule: "Resultados parciais higienizados",
  },
]

const suggestionPipeline = [
  {
    play: "Aposta sugerida: Over 2.5 gols",
    league: "Bundesliga rodada 9",
    status: "Liberado",
    accuracy: "Taxa acerto 71%",
  },
  {
    play: "Scout tático - Blocos baixos",
    league: "Serie A rodada 10",
    status: "Em revisão",
    accuracy: "Modelos 82% prontos",
  },
  {
    play: "Insights probabilísticos - MLS",
    league: "MLS rodada 24",
    status: "Em produção",
    accuracy: "Novas features xThreat",
  },
]

const intelligenceKPIs = [
  {
    label: "Conversão Free → Start",
    value: "18%",
    change: "+3pp",
    detail: "Campanha de onboarding ajuda novas contas",
  },
  {
    label: "ROI médio apostas sugeridas",
    value: "12,4%",
    change: "+1,1pp",
    detail: "Com base em 420 picks publicados",
  },
  {
    label: "CAC (ticket médio)",
    value: "R$ 62",
    change: "-R$ 6",
    detail: "Melhora após automações com afiliados",
  },
  {
    label: "Taxa de retenção 90 dias",
    value: "86%",
    change: "+2pp",
    detail: "Melhora no fluxo de reengajamento",
  },
]

const affiliateInsights = [
  {
    channel: "Instagram Ads",
    clicks: 12450,
    conversions: 342,
    commission: "R$ 5.420",
  },
  {
    channel: "YouTube Conteúdo",
    clicks: 8750,
    conversions: 286,
    commission: "R$ 4.980",
  },
  {
    channel: "Parceiros Scout",
    clicks: 6320,
    conversions: 198,
    commission: "R$ 3.210",
  },
]

const couponCampaigns = [
  {
    code: "START10",
    audience: "Clientes Start",
    redemption: "148 usos",
    status: "Ativo",
    expires: "15/10",
  },
  {
    code: "AFF_JOAO",
    audience: "Rede afiliados",
    redemption: "63 usos",
    status: "Ativo",
    expires: "30/10",
  },
  {
    code: "EXPERTFLASH",
    audience: "Upgrade Expert",
    redemption: "Encerrado",
    status: "Finalizado",
    expires: "05/09",
  },
]

const exportJobs = [
  {
    name: "Relatório financeiro mensal",
    format: "Excel",
    status: "Concluído",
    timestamp: "Hoje • 07h20",
  },
  {
    name: "Logs de integração API",
    format: "CSV",
    status: "Processando",
    timestamp: "Hoje • 09h05",
  },
  {
    name: "Insights afiliados Q4",
    format: "PDF",
    status: "Agendado",
    timestamp: "Amanhã • 08h00",
  },
]

const systemAlerts = [
  {
    title: "Falha de sincronização CRM",
    severity: "Alto",
    detail: "Integração HubSpot em fila de retentativa",
    time: "Há 12 minutos",
  },
  {
    title: "Logs de cálculo xROI",
    severity: "Informativo",
    detail: "Normalização concluída",
    time: "Há 35 minutos",
  },
  {
    title: "Latency API externa",
    severity: "Médio",
    detail: "Resposta média 880ms nas últimas 2h",
    time: "Ontem",
  },
]

const integrations = [
  {
    provider: "HubSpot CRM",
    status: "Sincronizando",
    contacts: "3.200 registros",
  },
  {
    provider: "RD Station",
    status: "Ativo",
    contacts: "1.480 leads",
  },
  {
    provider: "Mailchimp",
    status: "Ativo",
    contacts: "980 segmentos",
  },
]

const mockUsers = [
  {
    name: "Marina Ferreira",
    email: "marina.ferreira@clienteopta.com",
    role: "Cliente",
    plan: "Profissional",
    seats: "3/5",
    status: "Ativo",
    lastActivity: "Há 2 horas",
  },
  {
    name: "João Viana",
    email: "joao.viana@expertbet.io",
    role: "Afiliado",
    plan: "Expert",
    seats: "5/5",
    status: "Ativo",
    lastActivity: "Há 18 minutos",
  },
  {
    name: "Luciana Prado",
    email: "luciana.prado@scoutanalytics.com",
    role: "Cliente",
    plan: "Elite",
    seats: "12/15",
    status: "Ativo",
    lastActivity: "Hoje • 09h14",
  },
  {
    name: "Carlos Mota",
    email: "carlos.mota@afiliadoscore.com",
    role: "Afiliado",
    plan: "Start",
    seats: "2/3",
    status: "Em revisão",
    lastActivity: "Ontem",
  },
]

const toolsUsage = [
  {
    name: "Gestão de cupons",
    percent: 58,
    detail: "Campanhas ativas com 43 cupons de afiliados",
  },
  {
    name: "Fluxo de notificações",
    percent: 72,
    detail: "Segmentação automática para 1.120 contatos",
  },
  {
    name: "Exportação de relatórios",
    percent: 65,
    detail: "120 PDFs enviados nas últimas 48h",
  },
  {
    name: "Integração CRM/Email",
    percent: 49,
    detail: "Sincronização em andamento com 3 ferramentas conectadas",
  },
]

export default function AdminPanelPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#04060c] via-[#05070d] to-[#03050a]">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Painel administrativo</Badge>
              <h1 className="mt-3 text-3xl font-bold text-white">Central do administrador</h1>
              <p className="text-white/60 text-sm">
                Controle total da operação, configure planos, usuários, notificações e métricas corporativas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-white/70 text-xs">
              <span>{adminProfile.name}</span>
              <span>•</span>
              <span>{adminProfile.role}</span>
              <span>•</span>
              <span>{adminProfile.lastAccess}</span>
            </div>
          </div>

          <Tabs defaultValue={tabs[0].value} className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 bg-[#05070d] border border-[#1f2935]">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-white">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboardMetrics.map((metric) => (
                  <Card key={metric.label} className="bg-[#0a101a] border-[#1f2935]">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-white text-sm uppercase tracking-wide">{metric.label}</CardTitle>
                      <CardDescription className="text-white text-xl font-semibold">{metric.value}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-primary text-xs uppercase tracking-wide">{metric.trend}</span>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Lista de usuários</Badge>
                    <CardTitle className="text-white text-xl">Fluxo de cadastros e afiliados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-white/70 text-sm">
                    <p>- 82 novos usuários na última semana (12 afiliados, 70 diretos)</p>
                    <p>- 14 contas suspensas aguardando atualização de pagamento</p>
                    <p>- 24 solicitações de migração para o plano Expert em análise</p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" className="text-white">
                        Gerenciar usuários
                      </Button>
                      <Button variant="outline" size="sm" className="text-white">
                        Exportar relatórios
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">KPIs em destaque</Badge>
                    <CardTitle className="text-white text-xl">Vendas por plano (últimos 30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-white/70 text-sm">
                    <p>- Plano Free → Start: 312 conversões</p>
                    <p>- Plano Start → Profissional: 174 conversões</p>
                    <p>- Plano Expert ou Elite: 96 upgrades</p>
                    <p>- Receita recorrente total: R$ 412.800</p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" className="gap-2 text-white">
                        <Wallet className="h-4 w-4" />
                        Ver painel financeiro
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Planos e KPIs</Badge>
                    <CardTitle className="text-white text-xl">Distribuição por assinatura</CardTitle>
                    <CardDescription className="text-white/70">
                      Volume de usuários e receita estimada para cada plano ativo nos últimos 30 dias.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {planBreakdown.map((plan) => (
                      <div
                        key={plan.plan}
                        className="flex flex-col gap-1 rounded-lg border border-[#1f2935] bg-[#05070d] p-3 text-white/80 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{plan.plan}</span>
                          <span className="text-primary">{plan.users} usuários</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>Receita: {plan.revenue}</span>
                          <span>{plan.trends}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Ferramentas extras</Badge>
                    <CardTitle className="text-white text-xl">Uso de ferramentas premium</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {toolsUsage.map((tool) => (
                      <div key={tool.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-medium">{tool.name}</p>
                          <span className="text-primary text-xs">{tool.percent}%</span>
                        </div>
                        <Progress value={tool.percent} className="h-2 bg-[#101726]" />
                        <p className="text-xs text-white/60">{tool.detail}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            <TabsContent value="usuarios" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Usuários cadastrados</Badge>
                  <CardTitle className="text-white text-xl">Carteira mockada da plataforma</CardTitle>
                  <CardDescription className="text-white/70">
                    Acompanhe os analistas, afiliados e administradores com status, planos e últimas atividades.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockUsers.map((user) => (
                    <div
                      key={user.email}
                      className="flex flex-col gap-3 rounded-lg border border-[#1f2935] bg-[#05070d] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#1f2935]">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user.name
                              .split(" ")
                              .map((part) => part.charAt(0))
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-white/60 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-white/70">
                        <span className="rounded-md bg-[#0a101a] px-3 py-1 border border-[#1f2935]">{user.role}</span>
                        <span className="rounded-md bg-[#0a101a] px-3 py-1 border border-[#1f2935]">
                          Plano: {user.plan}
                        </span>
                        <span className="rounded-md bg-[#0a101a] px-3 py-1 border border-[#1f2935]">
                          Licenças {user.seats}
                        </span>
                        <span className="rounded-md bg-[#0a101a] px-3 py-1 border border-[#1f2935]">{user.status}</span>
                      </div>
                      <div className="text-white/60 text-xs">
                        <p>Última atividade</p>
                        <p className="font-medium text-white">{user.lastActivity}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AdminSectionCards sections={adminSections.slice(0, 1)} />
            </TabsContent>

            <TabsContent value="conteudo" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Publicações recentes</Badge>
                  <CardTitle className="text-white text-xl">Produtos e conteúdo em andamento</CardTitle>
                  <CardDescription className="text-white/70">
                    Controle central dos pacotes publicados, promoções programadas e estatísticas por marketplace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contentReleases.map((release) => (
                    <div
                      key={release.title}
                      className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex flex-col gap-2"
                    >
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-white font-semibold">{release.title}</p>
                          <p className="text-white/60 text-xs">{release.stats}</p>
                        </div>
                        <Badge className="bg-[#0a101a] text-white/80 border border-[#1f2935]">{release.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-white/60">
                        <span>Squad: {release.owner}</span>
                        <span>{release.schedule}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Sugestões em pipeline</Badge>
                  <CardTitle className="text-white text-xl">Apostas e insights gerados pelo motor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestionPipeline.map((suggestion) => (
                    <div
                      key={suggestion.play}
                      className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex flex-col gap-1 text-sm text-white/80"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{suggestion.play}</p>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{suggestion.status}</Badge>
                      </div>
                      <p className="text-white/60 text-xs">{suggestion.league}</p>
                      <p className="text-white/60 text-xs">{suggestion.accuracy}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AdminSectionCards sections={adminSections.slice(1, 2)} />
            </TabsContent>

            <TabsContent value="metricas" className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {intelligenceKPIs.map((kpi) => (
                  <Card key={kpi.label} className="bg-[#0a101a] border-[#1f2935]">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-white text-sm uppercase tracking-wide">{kpi.label}</CardTitle>
                      <CardDescription className="text-white text-2xl font-semibold">{kpi.value}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-primary text-xs font-semibold">{kpi.change}</p>
                      <p className="text-white/60 text-xs mt-1">{kpi.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Afiliados e canais</Badge>
                  <CardTitle className="text-white text-xl">Desempenho por canal de aquisição</CardTitle>
                  <CardDescription className="text-white/70">
                    KPIs da última semana com comissões provisionadas e cliques rastreados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {affiliateInsights.map((channel) => (
                    <div
                      key={channel.channel}
                      className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex flex-col gap-1 text-sm text-white/80"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{channel.channel}</p>
                        <Badge className="bg-[#0a101a] text-white/80 border border-[#1f2935] text-xs">
                          Comissão {channel.commission}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>Cliques {channel.clicks}</span>
                        <span>Conversões {channel.conversions}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AdminSectionCards sections={adminSections.slice(2, 3)} />
            </TabsContent>

            <TabsContent value="extras" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Cupons ativos</Badge>
                  <CardTitle className="text-white text-xl">Gestão de campanhas promocionais</CardTitle>
                  <CardDescription className="text-white/70">
                    Monitoramento de códigos, público-alvo e uso de cada campanha vigente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {couponCampaigns.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="flex flex-col gap-2 rounded-lg border border-[#1f2935] bg-[#05070d] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-white font-semibold">{coupon.code}</p>
                        <p className="text-white/60 text-xs">{coupon.audience}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-white/70">
                        <span>{coupon.redemption}</span>
                        <span>Expira {coupon.expires}</span>
                      </div>
                      <Badge
                        className={`text-xs ${
                          coupon.status === "Ativo"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-[#0a101a] text-white/70 border border-[#1f2935]"
                        }`}
                      >
                        {coupon.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <section className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Exportações</Badge>
                    <CardTitle className="text-white text-xl">Jobs e relatórios em andamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {exportJobs.map((job) => (
                      <div
                        key={job.name}
                        className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between text-sm text-white/80">
                          <span className="font-semibold">{job.name}</span>
                          <Badge className="bg-[#0a101a] text-white/70 border border-[#1f2935]">{job.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>
                            <FileDown className="inline-block h-3.5 w-3.5 mr-1 text-primary" />
                            {job.format}
                          </span>
                          <span>{job.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Alertas do sistema</Badge>
                    <CardTitle className="text-white text-xl">Logs e monitoramento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <div
                        key={alert.title}
                        className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 flex flex-col gap-1 text-sm text-white/80"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{alert.title}</p>
                          <Badge
                            className={`text-xs ${
                              alert.severity === "Alto"
                                ? "bg-red-500/10 text-red-400 border border-red-500/40"
                                : alert.severity === "Médio"
                                  ? "bg-orange-500/10 text-orange-300 border border-orange-500/40"
                                  : "bg-[#0a101a] text-white/70 border border-[#1f2935]"
                            }`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-xs">{alert.detail}</p>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Integrações</Badge>
                  <CardTitle className="text-white text-xl">CRM e e-mail marketing conectados</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {integrations.map((integration) => (
                    <div key={integration.provider} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold text-sm">{integration.provider}</p>
                        <MailCheck className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-white/70 text-xs mt-1">{integration.contacts}</p>
                      <Badge className="mt-3 bg-[#0a101a] text-white/80 border border-[#1f2935] text-xs">
                        {integration.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AdminSectionCards sections={adminSections.slice(3)} />
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="text-white">
                Ir para área do usuário
              </Button>
            </Link>
            <Link href="/dashboard/planos">
              <Button className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Configurar planos
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

interface AdminSection {
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  items: string[]
}

interface AdminSectionCardsProps {
  sections: AdminSection[]
}

function AdminSectionCards({ sections }: AdminSectionCardsProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <Card key={section.title} className="bg-[#0a101a] border-[#1f2935]">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-white/70">{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-white/80 text-sm">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
