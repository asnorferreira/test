"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { Trophy, ChevronDown } from "lucide-react"
import Image from "next/image"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface League {
  id: string
  name: string
  country: string
  logo: string
}

interface LeagueSectionProps {
  league: League
}



interface LeagueGame {
  id: string
  league: string
  status: "scheduled" | "finished"
  startTime: Date
  homeTeam: {
    name: string
    logo: string
    score?: number
  }
  awayTeam: {
    name: string
    logo: string
    score?: number
  }

}

const getLeagueGames = (leagueId: string): LeagueGame[] => {
  const gamesMap: Record<string, LeagueGame[]> = {
    "premier-league": [
      {
        id: `${leagueId}-1`,
        league: "Premier League",
        status: "scheduled",
        startTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        homeTeam: {
          name: "Manchester United",
          logo: "/manchester-united-crest.png",
        },
        awayTeam: {
          name: "Tottenham",
          logo: "/tottenham-hotspur-crest.png",
        },
        
      },
      {
        id: `${leagueId}-2`,
        league: "Premier League",
        status: "scheduled",
        startTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        homeTeam: {
          name: "Arsenal",
          logo: "/arsenal-football-club-emblem.png",
        },
        awayTeam: {
          name: "Chelsea",
          logo: "/football-club-badge.png",
        },
        
      },
      {
        id: `${leagueId}-3`,
        league: "Premier League",
        status: "scheduled",
        startTime: new Date(Date.now() + 14 * 60 * 60 * 1000),
        homeTeam: {
          name: "Liverpool",
          logo: "/liverpool-crest.png",
        },
        awayTeam: {
          name: "Newcastle",
          logo: "/generic-football-club-badge.png",
        },
        
         
        },
      
    ],
    "la-liga": [
      {
        id: `${leagueId}-1`,
        league: "La Liga",
        status: "scheduled",
        startTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        homeTeam: {
          name: "Atletico Madrid",
          logo: "/atletico-madrid-logo.png",
        },
        awayTeam: {
          name: "Valencia",
          logo: "/generic-soccer-club-badge.png",
        },
        
        },
      
      {
        id: `${leagueId}-2`,
        league: "La Liga",
        status: "scheduled",
        startTime: new Date(Date.now() + 13 * 60 * 60 * 1000),
        homeTeam: {
          name: "Real Madrid",
          logo: "/real-madrid-crest.png",
        },
        awayTeam: {
          name: "Sevilla",
          logo: "/generic-soccer-club-badge.png",
        },
        
      },
      {
        id: `${leagueId}-3`,
        league: "La Liga",
        status: "scheduled",
        startTime: new Date(Date.now() + 16 * 60 * 60 * 1000),
        homeTeam: {
          name: "Barcelona",
          logo: "/barcelona-crest.png",
        },
        awayTeam: {
          name: "Girona",
          logo: "/generic-soccer-club-badge.png",
        },
        
     },
      
    ],
    "serie-a": [
      {
        id: `${leagueId}-1`,
        league: "Serie A",
        status: "scheduled",
        startTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        homeTeam: {
          name: "Inter de Milão",
          logo: "/inter-milan-logo.png",
        },
        awayTeam: {
          name: "Napoli",
          logo: "/napoli-logo.png",
        },
        
      },
      {
        id: `${leagueId}-2`,
        league: "Serie A",
        status: "scheduled",
        startTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
        homeTeam: {
          name: "Milan",
          logo: "/ac-milan-logo.png",
        },
        awayTeam: {
          name: "Juventus",
          logo: "/juventus-logo.png",
        },
        
      },
      {
        id: `${leagueId}-3`,
        league: "Serie A",
        status: "scheduled",
        startTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        homeTeam: {
          name: "Roma",
          logo: "/generic-football-club-badge.png",
        },
        awayTeam: {
          name: "Lazio",
          logo: "/generic-football-club-badge.png",
        },
        
         
      },
      
    ],
    bundesliga: [
      {
        id: `${leagueId}-1`,
        league: "Bundesliga",
        status: "scheduled",
        startTime: new Date(Date.now() + 14 * 60 * 60 * 1000),
        homeTeam: {
          name: "RB Leipzig",
          logo: "/rb-leipzig-logo.jpg",
        },
        awayTeam: {
          name: "Bayer Leverkusen",
          logo: "/bayer-leverkusen-logo.png",
        },
        
         
       },
      
      {
        id: `${leagueId}-2`,
        league: "Bundesliga",
        status: "scheduled",
        startTime: new Date(Date.now() + 16 * 60 * 60 * 1000),
        homeTeam: {
          name: "Bayern de Munique",
          logo: "/football-club-badge.png",
        },
        awayTeam: {
          name: "Borussia Dortmund",
          logo: "/borussia-dortmund-logo.png",
        },
        
    
      },
      
      {
        id: `${leagueId}-3`,
        league: "Bundesliga",
        status: "scheduled",
        startTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
        homeTeam: {
          name: "Union Berlin",
          logo: "/generic-football-club-badge.png",
        },
        awayTeam: {
          name: "Eintracht Frankfurt",
          logo: "/generic-football-club-badge.png",
        },
        
          
       },
      
    ],
    "ligue-1": [
      {
        id: `${leagueId}-1`,
        league: "Ligue 1",
        status: "scheduled",
        startTime: new Date(Date.now() + 16 * 60 * 60 * 1000),
        homeTeam: {
          name: "PSG",
          logo: "/psg-logo-stylized.png",
        },
        awayTeam: {
          name: "Marseille",
          logo: "/marseille-logo.png",
        },
        
         
      },
      
      {
        id: `${leagueId}-2`,
        league: "Ligue 1",
        status: "scheduled",
        startTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        homeTeam: {
          name: "Lyon",
          logo: "/generic-football-club-badge.png",
        },
        awayTeam: {
          name: "Monaco",
          logo: "/generic-football-club-badge.png",
        },
        
          
      },
      
      {
        id: `${leagueId}-3`,
        league: "Ligue 1",
        status: "scheduled",
        startTime: new Date(Date.now() + 21 * 60 * 60 * 1000),
        homeTeam: {
          name: "Lille",
          logo: "/generic-football-club-badge.png",
        },
        awayTeam: {
          name: "Nice",
          logo: "/generic-football-club-badge.png",
        },
        
      },
      
    ],
    "champions-league": [
      {
        id: `${leagueId}-1`,
        league: "Champions League",
        status: "scheduled",
        startTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
        homeTeam: {
          name: "Manchester City",
          logo: "/generic-football-club-badge.png",
        },
        awayTeam: {
          name: "Real Madrid",
          logo: "/real-madrid-crest.png",
        },
        
      },
      
      {
        id: `${leagueId}-2`,
        league: "Champions League",
        status: "scheduled",
        startTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
        homeTeam: {
          name: "Inter de Milão",
          logo: "/inter-milan-logo.png",
        },
        awayTeam: {
          name: "Bayern de Munique",
          logo: "/football-club-badge.png",
        },
        
      },
      
      {
        id: `${leagueId}-3`,
        league: "Champions League",
        status: "scheduled",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        homeTeam: {
          name: "PSG",
          logo: "/psg-logo-stylized.png",
        },
        awayTeam: {
          name: "Atlético de Madrid",
          logo: "/atletico-madrid-logo.png",
        },
        
      },
    ],
  }

  return gamesMap[leagueId] || []
}

export function LeagueSection({ league }: LeagueSectionProps) {
  const [open, setOpen] = useState(false)
  const games = getLeagueGames(league.id)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="bg-[#0a101a] border-[#1f2935]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src={league.logo || "/placeholder.svg"} alt={league.name} width={32} height={32} className="rounded" />
            <div>
              <CardTitle className="text-white">{league.name}</CardTitle>
              <p className="text-sm text-white/70">{league.country}</p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button size="sm" className="gap-2">
              <Trophy className="w-4 h-4" />
              {open ? "Ocultar jogos" : "Ver jogos"}
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
              />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {games.length > 0 ? (
              games.map((game) => <GameCard key={game.id} game={game} />)
            ) : (
              <div className="text-center py-4">
                <p className="text-white">Nenhum jogo agendado</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

