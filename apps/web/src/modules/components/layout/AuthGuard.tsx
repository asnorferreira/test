'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { ROUTES } from '@/lib/routing/routes'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.replace(ROUTES.entrar)
    }
  }, [loading, session, router])

  if (loading) return <div style={{ padding: 32 }}>Carregando…</div>
  if (!session) return null
  return <>{children}</>
}
