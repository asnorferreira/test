"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader } from "@/components/dashboard-header"
import { FootballField } from "@/components/football-field"
import { GameHeader } from "@/components/game-header"
import { GameProbabilities } from "@/components/game-probabilities"
import { PlayerStats } from "@/components/player-stats"
import { TeamComparison } from "@/components/team-comparison"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, ShieldCheck } from "lucide-react"
import { useParams } from "next/navigation"

// Mock game data
const getGameData = (id: string) => ({
  id,
  homeTeam: {
    name: "Manchester City",
    logo: "/generic-football-club-badge.png",
    score: 2,
    formation: "4-3-3",
    players: [
      {
        id: "1",
        name: "Ederson",
        position: "GK",
        number: 31,
        photo: "/generic-player-avatar.png",
        fieldPosition: { x: 10, y: 50 },
        stats: {
          goals: 0,
          assists: 0,
          passes: 45,
          passAccuracy: 92,
          tackles: 0,
          saves: 3,
          shots: 0,
          shotsOnTargets: 0,
          foulsCommited: 0,
          foulsSuffered: 0
        },
        probabilities: {
          goal: 2,
          assist: 5,
          yellowCard: 15,
          redCard: 1,
        },
      },
      {
        id: "2",
        name: "Kyle Walker",
        position: "RB",
        number: 2,
        photo: "/generic-player-avatar.png",
        fieldPosition: { x: 25, y: 80 },
        stats: {
          goals: 0,
          assists: 1,
          passes: 67,
          passAccuracy: 88,
          tackles: 3,
          saves: 0,
          shots: 2,
          shotsOnTargets: 0,
          foulsCommited: 1,
          foulsSuffered: 0,
        },
        probabilities: {
          goal: 8,
          assist: 25,
          yellowCard: 30,
          redCard: 3,
        },
      },
      {
        id: "3",
        name: "Rúben Dias",
        position: "CB",
        number: 3,
        photo: "/generic-player-avatar.png",
        fieldPosition: { x: 20, y: 35 },
        stats: {
          goals: 0,
          assists: 0,
          passes: 89,
          passAccuracy: 95,
          tackles: 4,
          saves: 0,
          shots: 1,
          shotsOnTarget: 1,
          foulsCommited: 0,
          foulsSuffered: 1
        },
        probabilities: {
          goal: 5,
          assist: 8,
          yellowCard: 25,
          redCard: 2,
        },
      },
      {
        id: "4",
        name: "Erling Haaland",
        position: "ST",
        number: 9,
        photo: "/generic-player-avatar.png",
        fieldPosition: { x: 80, y: 50 },
        stats: {
          goals: 2,
          assists: 0,
          passes: 23,
          passAccuracy: 78,
          tackles: 0,
          saves: 0,
          shots: 3,
          shotsOnTargets: 2,
          foulsCommited: 0,
          foulsSuffered: 1
        },
        probabilities: {
          goal: 75,
          assist: 20,
          yellowCard: 15,
          redCard: 1,
        },
      },
    ],
  },
  awayTeam: {
    name: "Liverpool",
    logo: "/liverpool-crest.png",
    score: 1,
    formation: "4-3-3",
    players: [
      {
        id: "5",
        name: "Alisson",
        position: "GK",
        number: 1,
        photo: "/generic-player-avatar.png",
        fieldPosition: { x: 90, y: 50 },
        stats: {
          goals: 0,
          assists: 0,
          passes: 38,
          passAccuracy: 89,
          tackles: 0,
          saves: 5,
          shots: 0,
          shotsOnTargets: 0,
          foulsCommited: 0,
          foulsSuffered: 0
        },
        probabilities: {
          goal: 1,
          assist: 3,
          yellowCard: 10,
          redCard: 1,
        },
      },
      {
        id: "6",
        name: "Mohamed Salah",
        position: "RW",
        number: 11,
        photo: "/generic-player-avatar.png",
        fieldPosition: { x: 70, y: 80 },
        stats: {
          goals: 1,
          assists: 0,
          passes: 34,
          passAccuracy: 82,
          tackles: 1,
          saves: 0,
          shots: 2,
          shotsOnTargets: 1,
          foulsCommited: 1,
          foulsSuffered: 2

        },
        probabilities: {
          goal: 65,
          assist: 35,
          yellowCard: 20,
          redCard: 2,
        },
      },
    ],
  },
  league: "Premier League",
  status: "finished",
  minute: "90'",
  startTime: new Date(),
  venue: "Etihad Stadium",
  attendance: 55000,
})

const recentPerformanceLeaders = [
  {
    name: "Erling Haaland",
    team: "Manchester City",
    rating: "9.4",
    goals: 5,
    assists: 2,
    chancesCreated: 9,
    minutes: 270,
    highlight: "Decisivo nos ultimos 3 jogos com multi-gols e alta convers�o.",
  },
  {
    name: "Phil Foden",
    team: "Manchester City",
    rating: "8.7",
    goals: 2,
    assists: 4,
    chancesCreated: 11,
    minutes: 248,
    highlight: "Maior fornecedor de assistencias com 11 passes-chave.",
  },
  {
    name: "Mohamed Salah",
    team: "Liverpool",
    rating: "8.6",
    goals: 3,
    assists: 1,
    chancesCreated: 7,
    minutes: 255,
    highlight: "Participou diretamente de 4 gols e liderou xG do Liverpool.",
  },
]

const topBallWinners = [
  {
    name: "Rodri",
    team: "Manchester City",
    tackles: 12,
    interceptions: 7,
    duelsWon: "76%",
    recoveries: 25,
    highlight: "Sustentou a posse com maior volume de recuperacoes no meio.",
  },
  {
    name: "Virgil van Dijk",
    team: "Liverpool",
    tackles: 9,
    interceptions: 10,
    duelsWon: "81%",
    recoveries: 22,
    highlight: "Dominio aereo e cortes decisivos evitando grandes chances.",
  },
  {
    name: "John Stones",
    team: "Manchester City",
    tackles: 8,
    interceptions: 6,
    duelsWon: "74%",
    recoveries: 19,
    highlight: "Equilibrio entre saida de bola e pressao para retomar posse.",
  },
]

export default function GameDetailsPage() {
  const params = useParams()
  const gameId = params.id as string
  const game = getGameData(gameId)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-6">
          <GameHeader game={game} />

          <Tabs defaultValue="field" className="space-y-6">
            <TabsList className="bg-[#0a101a] border-[#1f2935]">
              <TabsTrigger
                value="field"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Campo & Jogadores
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Estatísticas
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Probabilidades
              </TabsTrigger>
              <TabsTrigger
                value="match-stats"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Desempenho recent.
              </TabsTrigger>
              <TabsTrigger
                value="probabilities"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
               
                Estatísticas do Confronto
              </TabsTrigger>
              <TabsTrigger
                value="ball-winners"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Maiores desarmes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="field">
              <FootballField game={game} />
            </TabsContent>

            <TabsContent value="stats">
              <PlayerStats game={game} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Desempenho 3 jogos</Badge>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Maiores desempenhos recentes</h2>
                  <p className="text-white/60 text-sm">
                    Ranking construído com base nas 3 partidas anteriores, combinando gols, assistências e índice tático.
                  </p>
                </div>
                <LineChart className="h-8 w-8 text-primary" />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {recentPerformanceLeaders.map((player) => (
                  <Card key={player.name} className="bg-[#05070d] border-[#1f2935]">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-white text-xl">{player.name}</CardTitle>
                      <p className="text-white/60 text-sm">{player.team}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs uppercase tracking-wide">Rating Opta</span>
                        <span className="text-2xl font-bold text-white">{player.rating}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Gols</p>
                          <p className="text-white font-semibold">{player.goals}</p>
                        </div>
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Assistências</p>
                          <p className="text-white font-semibold">{player.assists}</p>
                        </div>
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Chances criadas</p>
                          <p className="text-white font-semibold">{player.chancesCreated}</p>
                        </div>
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Minutos</p>
                          <p className="text-white font-semibold">{player.minutes}</p>
                        </div>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed">{player.highlight}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="probabilities">
              <GameProbabilities game={game} />
            </TabsContent>

            <TabsContent value="match-stats">
              <TeamComparison game={game} />
            </TabsContent>

            <TabsContent value="ball-winners" className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Intensidade defensiva</Badge>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Especialistas em desarmes e recuperações</h2>
                  <p className="text-white/60 text-sm">
                    Monitoramos métricas de pressão, interceptações e duelos ganhos para evidenciar os guardiões da posse.
                  </p>
                </div>
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {topBallWinners.map((player) => (
                  <Card key={player.name} className="bg-[#05070d] border-[#1f2935]">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-white text-xl">{player.name}</CardTitle>
                      <p className="text-white/60 text-sm">{player.team}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Desarmes</p>
                          <p className="text-white font-semibold">{player.tackles}</p>
                        </div>
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Intercept.</p>
                          <p className="text-white font-semibold">{player.interceptions}</p>
                        </div>
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Duelos ganhos</p>
                          <p className="text-white font-semibold">{player.duelsWon}</p>
                        </div>
                        <div className="rounded-lg border border-[#1f2935] bg-[#0a101a] px-3 py-2">
                          <p className="text-white/50 text-xs uppercase">Recuperações</p>
                          <p className="text-white font-semibold">{player.recoveries}</p>
                        </div>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed">{player.highlight}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  )
}
