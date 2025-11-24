"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarClock, Share2, Target, UserCheck, UserCog } from "lucide-react"
import Link from "next/link"

const userProfile = {
  name: "Marina Ferreira",
  role: "Coordenadora de Inteligência Esportiva",
  email: "marina.ferreira@clienteopta.com",
  phone: "+55 11 99876-5532",
  plan: "Plano Profissional",
  company: "Clube Scout360",
  document: "CPF 123.456.789-00",
  since: "Cliente desde março/2024",
  renewal: "Renovação em 12 out 2025",
  seatsUsed: 3,
  seatsAvailable: 5,
  scoutLimit: "Scout Free liberado para 1 jogo/rodada",
}

const recentActivities = [
  {
    title: "Dashboard tático atualizado",
    detail: "Manchester City x Arsenal",
    timestamp: "Hoje • 10:12",
  },
  {
    title: "Exportação enviada",
    detail: "Relatório PDF - Premier League rodada 32",
    timestamp: "Ontem • 19:40",
  },
  {
    title: "Alerta configurado",
    detail: "Gols no 1º tempo - Liga Espanhola",
    timestamp: "Há 2 dias",
  },
]

const inviteSteps = [
  "Compartilhe o link personalizado com colegas ou afiliados.",
  "Cada assinatura ativa concede 10% de desconto no próximo ciclo.",
  "Acompanhe cliques, conversões e comissões no painel administrativo.",
]

const inviteDetails = {
  link: "https://app.opta.com/r/marina",
  discount: "10% de desconto recorrente",
  bonus: "R$ 25 em créditos por indicação ativa por 30 dias",
}

const tabs = [
  { value: "overview", label: "Visão geral" },
  { value: "dados", label: "Dados cadastrais" },
  { value: "convidar", label: "Convide e ganhe" },
]

export default function UserPanelPage() {
  const initials = userProfile.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const seatPercent = Math.round((userProfile.seatsUsed / userProfile.seatsAvailable) * 100)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20">Perfil completo</Badge>
              <h1 className="mt-3 text-3xl font-bold text-white">Central do cliente</h1>
              <p className="text-white/60 text-sm">
                Ajuste seus dados, revise permissões e acompanhe atividades recentes dentro da plataforma.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="text-white">
                  Voltar ao dashboard
                </Button>
              </Link>
              <Link href="/dashboard/planos">
                <Button className="gap-2">
                  <Target className="h-4 w-4" />
                  Gerenciar plano
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue={tabs[0].value} className="space-y-6">
            <TabsList className="bg-[#05070d] border border-[#1f2935] flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-white">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border border-[#1f2935]">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-2xl">{userProfile.name}</CardTitle>
                      <CardDescription className="text-white/60">{userProfile.role}</CardDescription>
                      <p className="text-white/50 text-xs">{userProfile.since}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{userProfile.plan}</Badge>
                    <Badge className="bg-[#05070d] border-[#1f2935] text-white/80">{userProfile.scoutLimit}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileField label="Email" value={userProfile.email} />
                    <ProfileField label="Telefone" value={userProfile.phone} />
                    <ProfileField label="Empresa" value={userProfile.company} />
                    <ProfileField label="Documento" value={userProfile.document} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <UsageCard
                      title="Acessos por analistas"
                      description={`${userProfile.seatsUsed} de ${userProfile.seatsAvailable} licenças em uso`}
                      value={`${seatPercent}%`}
                      progress={seatPercent}
                    />
                    <UsageCard
                      title="Renovação automática"
                      description={userProfile.renewal}
                      value="Ativada"
                      icon={<CalendarClock className="h-5 w-5 text-primary" />}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Atividades recentes</Badge>
                  <CardTitle className="text-white text-xl">Histórico de ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.title} className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{activity.title}</p>
                        <span className="text-white/60 text-xs">{activity.timestamp}</span>
                      </div>
                      <p className="text-white/70 text-sm mt-1">{activity.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dados" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Dados cadastrais</Badge>
                  <CardTitle className="text-white text-xl">Informações do cliente</CardTitle>
                  <CardDescription className="text-white/70">
                    Revise e ajuste informações principais e canais de contato utilizados para notificações.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileField label="Nome completo" value={userProfile.name} />
                    <ProfileField label="Email principal" value={userProfile.email} />
                    <ProfileField label="Telefone" value={userProfile.phone} />
                    <ProfileField label="Empresa" value={userProfile.company} />
                    <ProfileField label="Documento" value={userProfile.document} />
                    <ProfileField label="Plano ativo" value={userProfile.plan} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2">
                      <UserCheck className="h-4 w-4" />
                      Salvar ajustes
                    </Button>
                    <Button variant="outline" className="text-white">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="convidar" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader>
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Indicacões com desconto</Badge>
                  <CardTitle className="text-white text-xl">Programa Afiliado Cliente</CardTitle>
                  <CardDescription className="text-white/70">
                    Ganhe créditos e descontos ao indicar amigos para os planos Start, Profissional ou Elite.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <code className="flex-1 rounded-md border border-[#1f2935] bg-[#05070d] px-3 py-2 text-sm text-primary">
                      {inviteDetails.link}
                    </code>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Copiar link
                    </Button>
                  </div>
                  <div className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 space-y-1">
                    <p className="text-white font-semibold">{inviteDetails.discount}</p>
                    <p className="text-white/60 text-xs">{inviteDetails.bonus}</p>
                  </div>
                  <div className="space-y-3">
                    {inviteSteps.map((step) => (
                      <div key={step} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <p className="text-white/80 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/planos">
                    <Button variant="outline" className="gap-2 text-white">
                      <UserCog className="h-4 w-4" />
                      Gerenciar benefícios
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}

interface ProfileFieldProps {
  label: string
  value: string
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  )
}

interface UsageCardProps {
  title: string
  description: string
  value: string
  progress?: number
  icon?: React.ReactNode
}

function UsageCard({ title, description, value, progress, icon }: UsageCardProps) {
  return (
    <div className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-semibold">{title}</p>
          <p className="text-white/60 text-xs">{description}</p>
        </div>
        {icon}
      </div>
      <p className="text-primary text-lg font-bold">{value}</p>
      {typeof progress === "number" && <Progress value={progress} className="h-2 bg-[#101726]" />}
    </div>
  )
}
