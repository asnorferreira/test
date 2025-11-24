"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import Image from "next/image"

interface GameProbabilitiesProps {
  game: any
}

export function GameProbabilities({ game }: GameProbabilitiesProps) {
  const allPlayers = [...game.homeTeam.players, ...game.awayTeam.players]

  const getTopPlayers = (stat: keyof any) =>
    allPlayers
      .slice()
      .sort((a, b) => b.probabilities[stat] - a.probabilities[stat])
      .slice(0, 5)

  const getBadgeTone = (probability: number) => {
    if (probability >= 50) return "text-green-400 bg-green-500/20 border-green-500/20"
    if (probability >= 25) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/20"
    return "text-red-400 bg-red-500/20 border-red-500/20"
  }

  const getBadgeIcon = (probability: number) => {
    if (probability >= 50) return <TrendingUp className="w-3 h-3" />
    if (probability >= 25) return <Minus className="w-3 h-3" />
    return <TrendingDown className="w-3 h-3" />
  }

  const renderProbabilityCard = (title: string, players: any[], stat: keyof any) => (
    <Card className="bg-[#0a101a] border-[#1f2935]">
      <CardHeader>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-[#141b27] rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold w-6">{index + 1}</span>
              <Image
                src={player.photo || "/placeholder.svg"}
                alt={player.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <div>
                <div className="text-white font-medium">{player.name}</div>
                <div className="text-xs text-white/70">{player.position}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={player.probabilities[stat]} className="w-20 h-2" />
              <Badge className={`${getBadgeTone(player.probabilities[stat])} flex items-center space-x-1`}>
                {getBadgeIcon(player.probabilities[stat])}
                <span>{player.probabilities[stat]}%</span>
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderProbabilityCard("Maior Probabilidade de Gol", getTopPlayers("goal"), "goal")}
      {renderProbabilityCard("Maior Probabilidade de Assistência", getTopPlayers("assist"), "assist")}
      {renderProbabilityCard("Maior Risco de Cartão Amarelo", getTopPlayers("yellowCard"), "yellowCard")}
      {renderProbabilityCard("Maior Risco de Cartão Vermelho", getTopPlayers("redCard"), "redCard")}
    </div>
  )
}
