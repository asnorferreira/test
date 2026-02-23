'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import styles from './layout.module.css'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { session, loading, isAdmin, isDoctor, isPatient, signOut } = useAuth()

  const next = useMemo(() => encodeURIComponent(pathname || '/admin/dashboard'), [pathname])

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace(`/entrar?next=${next}`)
      return
    }
    if (isAdmin) return
    if (isDoctor) router.replace('/painel-medico/casos')
    else if (isPatient) router.replace('/conta')
    else router.replace(`/entrar?next=${next}`)
  }, [isAdmin, isDoctor, isPatient, loading, next, router, session])

  const activePath = pathname || '/admin/dashboard'

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
  if (!isAdmin) return null

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <nav className={styles.topNavbar}>
          <div className={styles.navSide} />
          <Link href='/' className={styles.topLogo}>
            MãeMais
          </Link>
          <div className={styles.navSideRight}>
            <span className={styles.userPill}>{session.name}</span>
            <button
              type='button'
              className={styles.navButton}
              onClick={() => {
                signOut()
                router.push('/entrar')
              }}
            >
              Sair
            </button>
          </div>
        </nav>
      </header>

      <div className={styles.container}>
        <div className={styles.shell}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarTitle}>Administrador</p>
            <nav className={styles.menu}>
              <Link
                href='/admin/dashboard'
                className={`${styles.menuItem} ${activePath.startsWith('/admin/dashboard') ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>📈</span>
                <span>Dashboard</span>
              </Link>
              <Link
                href='/admin/pedidos'
                className={`${styles.menuItem} ${activePath.startsWith('/admin/pedidos') ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>🧾</span>
                <span>Pedidos</span>
              </Link>
              <Link
                href='/admin/prescricoes'
                className={`${styles.menuItem} ${activePath.startsWith('/admin/prescricoes') ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>📄</span>
                <span>Prescrições</span>
              </Link>
              <Link
                href='/admin/produto'
                className={`${styles.menuItem} ${activePath.startsWith('/admin/produto') ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>🧴</span>
                <span>Produto (MVP)</span>
              </Link>
            </nav>
          </aside>

          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </div>
  )
}
