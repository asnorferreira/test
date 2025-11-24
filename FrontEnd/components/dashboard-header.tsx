"use client"

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { BarChart3, User, Settings, LogOut, Crown } from "lucide-react"
import Link from "next/link"

export function DashboardHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-[#1f2935] bg-[#05070d]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#05070d]" />
          </div>
          <span className="text-xl font-bold text-white">Opta</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user?.subscription === "active" && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#141b27] text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#0a101a] border-[#1f2935]" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-white">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-[#1f2935]" />
              <DropdownMenuItem className="text-white focus:bg-[#141b27] focus:text-white">
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white focus:bg-[#141b27] focus:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1f2935]" />
              <DropdownMenuItem
                className="text-[#ff6b6b] focus:bg-[#2b1012] focus:text-[#ff6b6b]"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

