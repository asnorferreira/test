'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import styles from './layout.module.css'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function PainelMedicoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { session, loading, isDoctor, signOut } = useAuth()

  const next = useMemo(() => encodeURIComponent(pathname || '/painel-medico/casos'), [pathname])

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace(`/entrar-medico?next=${next}`)
      return
    }
    if (!isDoctor) router.replace(`/entrar-medico?next=${next}`)
  }, [isDoctor, next, router, session])

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.topNav}>
          <nav className={styles.topNavbar}>
            <div className={styles.topLogo}>MãeMais</div>
          </nav>
        </header>
        <div className={styles.container}>
          <div className={styles.card}>Carregando…</div>
        </div>
      </div>
    )
  }

  if (!session) return null
  if (!isDoctor) return null

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <nav className={styles.topNavbar}>
          <Link href='/' className={styles.topLogo}>
            MãeMais
          </Link>
          <div className={styles.navRight}>
            <Link href='/painel-medico/casos' className={styles.navLink}>
              Casos
            </Link>
            <button
              type='button'
              className={styles.navButton}
              onClick={() => {
                signOut()
                router.push('/entrar-medico')
              }}
            >
              Sair
            </button>
          </div>
        </nav>
      </header>

      <div className={styles.container}>{children}</div>
    </div>
  )
}
