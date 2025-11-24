"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { Clock, Play } from "lucide-react"

interface LiveGamesProps {
  showAll?: boolean
}

const liveGames = [
  {
    id: "1",
    homeTeam: {
      name: "Manchester City",
      logo: "/generic-football-club-badge.png",
      score: 2,
    },
    awayTeam: {
      name: "Liverpool",
      logo: "/liverpool-crest.png",
      score: 1,
    },
    league: "Premier League",
    status: "live",
    minute: "67'",
    startTime: new Date(),
  },
  {
    id: "2",
    homeTeam: {
      name: "Real Madrid",
      logo: "/real-madrid-crest.png",
      score: 0,
    },
    awayTeam: {
      name: "Barcelona",
      logo: "/barcelona-crest.png",
      score: 0,
    },
    league: "La Liga",
    status: "live",
    minute: "23'",
    startTime: new Date(),
  },
]

export function LiveGames({ showAll = false }: LiveGamesProps) {
  const displayGames = showAll ? liveGames : liveGames.slice(0, 2)

  if (liveGames.length === 0) {
    return (
      <Card className="bg-[#0a101a] border-[#1f2935]">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Play className="w-5 h-5 mr-2 text-red-500" />
            Jogos em Destaque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-white mx-auto mb-4" />
            <p className="text-white">Nenhum jogo em destaque no momento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0a101a] border-[#1f2935]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
          Jogos em Destaque
        </CardTitle>
        {!showAll && liveGames.length > 2 && (
          <Button size="sm">
            Ver todos ({liveGames.length})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {displayGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </CardContent>
    </Card>
  )
}


