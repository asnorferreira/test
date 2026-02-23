'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { session, loading, isPatient, isDoctor, isAdmin } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace('/entrar')
      return
    }
    if (isPatient) return
    if (isAdmin) {
      router.replace('/admin/pedidos')
      return
    }
    if (isDoctor) router.replace('/painel-medico/casos')
    else router.replace('/entrar')
  }, [isAdmin, isDoctor, isPatient, loading, router, session])

  if (loading) return null
  if (!session) return null
  if (!isPatient) return null

  return children
}
