"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeagueSection } from "@/components/league-section"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Target, UserRound } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const leagues = [
  {
    id: "premier-league",
    name: "Premier League",
    country: "Inglaterra",
    logo: "/generic-football-league-badge.png",
  },
  {
    id: "la-liga",
    name: "La Liga",
    country: "Espanha",
    logo: "/spanish-football-league-logo.png",
  },
  {
    id: "serie-a",
    name: "Serie A",
    country: "Itália",
    logo: "/serie-a-logo.png",
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    country: "Alemanha",
    logo: "/bundesliga-logo.png",
  },
  {
    id: "ligue-1",
    name: "Ligue 1",
    country: "França",
    logo: "/ligue-1-logo.png",
  },
  {
    id: "champions-league",
    name: "Champions League",
    country: "Europa",
    logo: "/generic-football-tournament-logo.png",
  },
]

const featuredMatch = {
  league: "Champions League",
  stadium: "Etihad Stadium",
  kickoff: "21:45",
  homeTeam: {
    name: "Manchester City",
    logo: "/generic-football-club-badge.png",
    score: 2,
  },
  awayTeam: {
    name: "Real Madrid",
    logo: "/real-madrid-crest.png",
    score: 2,
  },
}

const userProfile = {
  name: "Marina Ferreira",
  email: "marina.ferreira@clienteopta.com",
  plan: "Plano Profissional",
  phone: "+55 11 99876-5532",
  company: "Clube Scout360",
  renewal: "Renova em 12 out 2025",
  seatUsage: "3/5 analistas ativos",
  location: "São Paulo - SP",
}

const planHighlights = [
  "Dashboards ilimitados com widgets premium",
  "Exportação em PDF/CSV/API em tempo real",
  "Insights automatizados e alertas inteligentes",
  "Suporte 24/7 com squad dedicado",
]

const inviteGuide = [
  "Envie o link exclusivo abaixo para colegas e parceiros.",
  "Cada assinatura ativa libera 10% de desconto recorrente.",
  "Acompanhe cliques e conversões no painel de afiliados.",
]

const inviteDetails = {
  link: "https://app.opta.com/r/marina",
  discount: "10% de desconto por indicação confirmada",
  bonus: "R$ 25 de crédito para cada afiliado ativo por 30 dias",
}

export default function DashboardPage() {
  const userInitials = userProfile.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="games" className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20">Área logada</Badge>
                <h1 className="mt-3 text-3xl font-bold text-white">Painel do usuário</h1>
                <p className="text-white/60 text-sm">
                  Navegue pelos jogos monitorados ou personalize o seu perfil e plano ativo.
                </p>
              </div>
              <TabsList className="bg-[#0a101a] border border-[#1f2935]">
                <TabsTrigger value="games" className="text-white data-[state=active]:bg-primary">
                  Jogos e ligas
                </TabsTrigger>
                <TabsTrigger value="profile" className="text-white data-[state=active]:bg-primary">
                  Perfil do usuário
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="games">
              <section className="grid gap-6">
               

                <section className="space-y-6">
                  <header className="text-center">
                    <h2 className="text-3xl font-bold text-white">Jogos por Liga</h2>
                    <p className="text-white/70">Expanda cada liga para visualizar confrontos e destaques</p>
                  </header>

                  <div className="space-y-4">
                    {leagues.map((league) => (
                      <LeagueSection key={league.id} league={league} />
                    ))}
                  </div>
                </section>
              </section>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-[#0a101a] border-[#1f2935]">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-[#1f2935]">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-2xl">{userProfile.name}</CardTitle>
                      <p className="text-white/60 text-sm">{userProfile.company}</p>
                      <p className="text-white/40 text-xs">{userProfile.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{userProfile.plan}</Badge>
                    <Badge className="bg-[#05070d] border-[#1f2935] text-white/80">{userProfile.seatUsage}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileField label="Email" value={userProfile.email} />
                    <ProfileField label="Telefone" value={userProfile.phone} />
                    <ProfileField label="Renovação" value={userProfile.renewal} />
                    <ProfileField label="Plano atual" value={userProfile.plan} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/planos">
                      <Button className="gap-2">
                        <Target className="w-4 h-4" />
                        Editar plano
                      </Button>
                    </Link>
                    <Link href="/painel/usuario">
                      <Button variant="outline" className="gap-2 text-white">
                        <UserRound className="w-4 h-4" />
                        Ver painel completo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Benefícios do plano</Badge>
                    <CardTitle className="text-white text-xl">Recursos incluídos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {planHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <p className="text-white/80 text-sm">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-[#0a101a] border-[#1f2935]">
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Indicações e descontos</Badge>
                    <CardTitle className="text-white text-xl">Convide amigos e ganhe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-[#1f2935] bg-[#05070d] p-4 space-y-2">
                      <p className="text-sm font-semibold text-white">{inviteDetails.discount}</p>
                      <p className="text-white/60 text-xs">{inviteDetails.bonus}</p>
                    </div>
                    <div className="space-y-3">
                      {inviteGuide.map((step) => (
                        <div key={step} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <p className="text-white/80 text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <code className="flex-1 rounded-md border border-[#1f2935] bg-[#05070d] px-3 py-2 text-sm text-primary">
                        {inviteDetails.link}
                      </code>
                      <Button variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Copiar link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}

interface TeamPreviewProps {
  team: {
    name: string
    logo: string
    score: number
  }
}

function TeamPreview({ team }: TeamPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[140px] text-center">
      <Image
        src={team.logo || "/placeholder.svg"}
        alt={team.name}
        width={72}
        height={72}
        className="rounded-full border border-[#2a3648] bg-[#141b27] p-2"
      />
      <span className="text-white text-lg font-semibold">{team.name}</span>
    </div>
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
