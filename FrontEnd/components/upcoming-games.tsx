"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { Calendar } from "lucide-react"

interface UpcomingGamesProps {
  showAll?: boolean
}

const upcomingGames = [
  {
    id: "3",
    homeTeam: {
      name: "Arsenal",
      logo: "/arsenal-football-club-emblem.png",
    },
    awayTeam: {
      name: "Chelsea",
      logo: "/football-club-badge.png",
    },
    league: "Premier League",
    status: "scheduled",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
  },
  {
    id: "4",
    homeTeam: {
      name: "Juventus",
      logo: "/juventus-logo.png",
    },
    awayTeam: {
      name: "AC Milan",
      logo: "/ac-milan-logo.png",
    },
    league: "Serie A",
    status: "scheduled",
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
  },
  {
    id: "5",
    homeTeam: {
      name: "Bayern Munich",
      logo: "/football-club-badge.png",
    },
    awayTeam: {
      name: "Borussia Dortmund",
      logo: "/borussia-dortmund-logo.png",
    },
    league: "Bundesliga",
    status: "scheduled",
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
  },
]

export function UpcomingGames({ showAll = false }: UpcomingGamesProps) {
  const displayGames = showAll ? upcomingGames : upcomingGames.slice(0, 3)

  return (
    <Card className="bg-[#0a101a] border-[#1f2935]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Próximos Jogos
        </CardTitle>
        {!showAll && upcomingGames.length > 3 && (
          <Button size="sm">
            Ver todos ({upcomingGames.length})
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
