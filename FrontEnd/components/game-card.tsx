"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FeaturedPlayer {
  name: string
  position: string
  photo: string
}

interface Team {
  name: string
  logo: string
  score?: number
}

interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  league: string
  status: "scheduled" | "finished"
  startTime: Date
 
}

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const getStatusBadge = () => {
    if (game.status === "finished") {
      return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Finalizado</Badge>
    }

    return (
      <Badge className="bg-primary/10 text-primary border-primary/20">
        <Clock className="w-3 h-3 mr-1" />
        {formatTime(game.startTime)}
      </Badge>
    )
  }

  const renderTeam = (team: Team) => (
    <div className="flex flex-col items-center gap-2 min-w-[140px]">
      <Image
        src={team.logo || "/placeholder.svg"}
        alt={team.name}
        width={48}
        height={48}
        className="rounded-full border border-[#2a3648] bg-[#141b27] p-1"
      />
      <span className="text-white font-semibold text-center">{team.name}</span>
    </div>
  )

  const renderPlayer = (player: FeaturedPlayer) => (
    <div key={player.name} className="flex items-center gap-3 rounded-lg border border-[#2a3648] bg-[#141b27] px-3 py-2">
      <Image
        src={player.photo || "/generic-player-avatar.png"}
        alt={player.name}
        width={40}
        height={40}
        className="rounded-full border border-[#2a3648]"
      />
      <div className="leading-tight">
        <p className="text-white font-medium">{player.name}</p>
        <p className="text-xs text-white/70 uppercase">{player.position}</p>
      </div>
    </div>
  )

  const homeScore = game.homeTeam.score ?? "-"
  const awayScore = game.awayTeam.score ?? "-"

  return (
    <Card className="bg-[#141b27] border-[#2a3648]">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>{game.league}</span>
          {getStatusBadge()}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {renderTeam(game.homeTeam)}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 text-3xl font-bold text-white">
              <span>{homeScore}</span>
              <span className="text-primary">x</span>
              <span>{awayScore}</span>
            </div>
            {game.status === "scheduled" && (
              <span className="text-xs text-white/60">Horário de início · {formatTime(game.startTime)}</span>
            )}
          </div>
          {renderTeam(game.awayTeam)}
        </div>

       

        <div className="flex justify-center">
          <Link href={`/game/${game.id}`}>
            <Button size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Ver análise completa
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
