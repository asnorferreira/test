"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

interface PlayerStatsProps {
  game: any
}

export function PlayerStats({ game }: PlayerStatsProps) {
  const renderPlayerCard = (player: any) => (
    <Card key={player.id} className="bg-[#141b27] border-[#2a3648]">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Image
            src={player.photo || "/placeholder.svg"}
            alt={player.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h4 className="font-semibold text-white">{player.name}</h4>
            <div className="flex items-center space-x-2">
              <Badge className="bg-[#1f2935] text-white text-xs">#{player.number}</Badge>
              <Badge className="bg-primary/20 text-primary text-xs">{player.position}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Gols</div>
            <div className="text-white font-bold">{player.stats.goals}</div>
          </div>
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Assistências</div>
            <div className="text-white font-bold">{player.stats.assists}</div>
          </div>
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Passes</div>
            <div className="text-white font-bold">{player.stats.passes}</div>
          </div>
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Precisão</div>
            <div className="text-white font-bold">{player.stats.passAccuracy}%</div>
          </div>
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Finalizações</div>
            <div className="text-white font-bold">{player.stats.shots}</div>
          </div>
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Finalizações ao Gol</div>
            <div className="text-white font-bold">{player.stats.shotsOnTargets}</div>
          </div>
          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Desarmes</div>
            <div className="text-white font-bold">{player.stats.tackles}</div>
          </div>

          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Faltas Cometidas</div>
            <div className="text-white font-bold">{player.stats.foulsCommited}</div>
          </div>

          <div className="bg-[#0a101a] p-2 rounded">
            <div className="text-white">Faltas Sofridas</div>
            <div className="text-white font-bold">{player.stats.foulsSuffered}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="home" className="space-y-6">
      <TabsList className="bg-[#0a101a] border-[#1f2935]">
        <TabsTrigger value="home" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          {game.homeTeam.name}
        </TabsTrigger>
        <TabsTrigger value="away" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          {game.awayTeam.name}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home">
        <Card className="bg-[#0a101a] border-[#1f2935]">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <Image
                src={game.homeTeam.logo || "/placeholder.svg"}
                alt={game.homeTeam.name}
                width={32}
                height={32}
                className="rounded"
              />
              <span>{game.homeTeam.name} - Estatísticas dos Jogadores</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {game.homeTeam.players.map(renderPlayerCard)}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="away">
        <Card className="bg-[#0a101a] border-[#1f2935]">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <Image
                src={game.awayTeam.logo || "/placeholder.svg"}
                alt={game.awayTeam.name}
                width={32}
                height={32}
                className="rounded"
              />
              <span>{game.awayTeam.name} - Estatísticas dos Jogadores</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {game.awayTeam.players.map(renderPlayerCard)}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
