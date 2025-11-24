"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface TeamComparisonProps {
  game: any
}

export function TeamComparison({ game }: TeamComparisonProps) {
  const comparisonStats = [
    {
      label: "Posse de Bola",
      home: 65,
      away: 35,
    },
    {
      label: "Finalizações",
      home: 12,
      away: 8,
    },
    {
      label: "Finalizações no Gol",
      home: 6,
      away: 4,
    },
    {
      label: "Passes Certos",
      home: 89,
      away: 82,
    },
    {
      label: "Faltas",
      home: 7,
      away: 11,
    },
    {
      label: "Escanteios",
      home: 5,
      away: 3,
    },
    {
      label: "Impedimentos",
      home: 2,
      away: 4,
    },
    {
      label:"Gols marcados",
      home: 3,
      away: 1,
    },
    {
      label: "Gols Sofridos",
      home: 1,
      away: 3,
    },
    {
      label: "Faltas Sofridas",
      home: 5,
      away: 7,
    },
    {
      label: "Mais de 2.5 Gols",
      home: 1,
      away: 0,
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a101a] border-[#1f2935]">
        <CardHeader>
          <CardTitle className="text-white">Comparação entre Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {comparisonStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={game.homeTeam.logo || "/placeholder.svg"}
                    alt={game.homeTeam.name}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                  <span className="text-white font-medium">{stat.home}</span>
                </div>
                <span className="text-white font-medium">{stat.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{stat.away}</span>
                  <Image
                    src={game.awayTeam.logo || "/placeholder.svg"}
                    alt={game.awayTeam.name}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                </div>
              </div>
              <div className="relative">
                <Progress
                  value={stat.label === "Posse de Bola" ? stat.home : (stat.home / (stat.home + stat.away)) * 100}
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>


    </div>
  )
}
