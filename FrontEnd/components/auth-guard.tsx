"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireSubscription?: boolean
}

export function AuthGuard({ children, requireSubscription = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (requireSubscription && user.subscription !== "active") {
        router.push("/subscription")
        return
      }
    }
  }, [user, loading, requireSubscription, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d] flex items-center justify-center">
        <Card className="bg-[#0a101a] border-[#1f2935]">
          <CardContent className="flex items-center space-x-4 p-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-white">Carregando...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || (requireSubscription && user.subscription !== "active")) {
    return null
  }

  return <>{children}</>
}

