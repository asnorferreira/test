"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import Image from "next/image"

interface Player {
  id: string
  name: string
  position: string
  number: number
  photo: string
  fieldPosition: { x: number; y: number }
  stats: any
  probabilities: any
}

interface FootballFieldProps {
  game: any
}

export function FootballField({ game }: FootballFieldProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const allPlayers = [...game.homeTeam.players, ...game.awayTeam.players]

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-[#0a101a] border-[#1f2935]">
          <CardHeader>
            <CardTitle className="text-white">Campo de Jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-green-600 rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
              {/* Field markings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
                {/* Field outline */}
                <rect x="20" y="20" width="760" height="460" fill="none" stroke="white" strokeWidth="3" />

                {/* Center line */}
                <line x1="400" y1="20" x2="400" y2="480" stroke="white" strokeWidth="2" />

                {/* Center circle */}
                <circle cx="400" cy="250" r="60" fill="none" stroke="white" strokeWidth="2" />

                {/* Penalty areas */}
                <rect x="20" y="140" width="120" height="220" fill="none" stroke="white" strokeWidth="2" />
                <rect x="660" y="140" width="120" height="220" fill="none" stroke="white" strokeWidth="2" />

                {/* Goal areas */}
                <rect x="20" y="190" width="40" height="120" fill="none" stroke="white" strokeWidth="2" />
                <rect x="740" y="190" width="40" height="120" fill="none" stroke="white" strokeWidth="2" />

                {/* Goals */}
                <rect x="10" y="220" width="10" height="60" fill="white" />
                <rect x="780" y="220" width="10" height="60" fill="white" />
              </svg>

              {/* Players */}
              {allPlayers.map((player) => (
                <button
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                  style={{
                    left: `${player.fieldPosition.x}%`,
                    top: `${player.fieldPosition.y}%`,
                  }}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full border-2 ${
                        game.homeTeam.players.includes(player)
                          ? "bg-primary border-[#b98a12]"
                          : "bg-red-500 border-red-300"
                      } flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-white font-bold text-sm">{player.number}</span>
                    </div>
                    {selectedPlayer?.id === player.id && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-8 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary rounded-full" />
                <span className="text-white">{game.homeTeam.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
                <span className="text-white">{game.awayTeam.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-[#0a101a] border-[#1f2935]">
          <CardHeader>
            <CardTitle className="text-white">Detalhes do Jogador</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlayer ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Image
                    src={selectedPlayer.photo || "/placeholder.svg"}
                    alt={selectedPlayer.name}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-2"
                  />
                  <h3 className="text-lg font-bold text-white">{selectedPlayer.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <Badge className="bg-[#1f2935] text-white">#{selectedPlayer.number}</Badge>
                    <Badge className="bg-primary/20 text-primary">{selectedPlayer.position}</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Estatísticas</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#141b27] p-2 rounded">
                      <div className="text-white">Gols</div>
                      <div className="text-white font-bold">{selectedPlayer.stats.goals}</div>
                    </div>
                    <div className="bg-[#141b27] p-2 rounded">
                      <div className="text-white">Assistências</div>
                      <div className="text-white font-bold">{selectedPlayer.stats.assists}</div>
                    </div>
                    <div className="bg-[#141b27] p-2 rounded">
                      <div className="text-white">Passes</div>
                      <div className="text-white font-bold">{selectedPlayer.stats.passes}</div>
                    </div>
                    <div className="bg-[#141b27] p-2 rounded">
                      <div className="text-white">Precisão</div>
                      <div className="text-white font-bold">{selectedPlayer.stats.passAccuracy}%</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Probabilidades</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Gol</span>
                      <Badge className="bg-green-500/20 text-green-400">{selectedPlayer.probabilities.goal}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Assistência</span>
                      <Badge className="bg-primary/20 text-primary">{selectedPlayer.probabilities.assist}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Cartão Amarelo</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        {selectedPlayer.probabilities.yellowCard}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Cartão Vermelho</span>
                      <Badge className="bg-red-500/20 text-red-400">{selectedPlayer.probabilities.redCard}%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white">Clique em um jogador no campo para ver seus detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
