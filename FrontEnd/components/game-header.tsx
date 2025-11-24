"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface GameHeaderProps {
  game: any
}

export function GameHeader({ game }: GameHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = () => {
    switch (game.status) {
      case "live":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-lg px-3 py-1">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
            {game.minute}
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-lg px-3 py-1">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(game.startTime)}
          </Badge>
        )
      case "finished":
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-lg px-3 py-1">Finalizado</Badge>
        )
    }
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
        <div className="flex items-center space-x-4 text-sm text-white">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{game.venue}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{game.attendance?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Card className="bg-[#0a101a] border-[#1f2935]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white">{game.league}</span>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10">
            <div className="flex flex-col items-center text-center gap-2">
              <Image
                src={game.homeTeam.logo || "/placeholder.svg"}
                alt={game.homeTeam.name}
                width={64}
                height={64}
                className="rounded mx-auto mb-2"
              />
              <h2 className="text-xl font-bold text-white">{game.homeTeam.name}</h2>
              <p className="text-sm text-white/70">{game.homeTeam.formation}</p>
            </div>

            <div className="text-center">
              {game.status === "live" || game.status === "finished" ? (
                <div className="flex items-center gap-6 text-4xl font-bold text-white">
                  <span>{game.homeTeam.score}</span>
                  <span className="text-primary">x</span>
                  <span>{game.awayTeam.score}</span>
                </div>
              ) : (
                <div className="text-2xl text-white">vs</div>
              )}
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <Image
                src={game.awayTeam.logo || "/placeholder.svg"}
                alt={game.awayTeam.name}
                width={64}
                height={64}
                className="rounded mx-auto mb-2"
              />
              <h2 className="text-xl font-bold text-white">{game.awayTeam.name}</h2>
              <p className="text-sm text-white/70">{game.awayTeam.formation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
