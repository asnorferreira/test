'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { getSession, isAdmin, signInPatient } from '@/modules/auth/services/auth.api'

const navLinks = [
  {
    label: 'Tratamentos',
    children: [
      { label: 'Produção de leite', href: '#producao' },
      { label: 'Autocuidado materno', href: '#autocuidado' },
      { label: 'Sono & descanso', href: '#sono' },
      { label: 'Bem-estar emocional', href: '#bemestar' },
    ],
  },
  { label: 'Guia', href: '#guia' },
  { label: 'Blog', href: '#blog' },
]
const navActions = [
  { label: 'Quem somos', href: '#sobre' },
  { label: 'Minha conta', href: '/conta' },
]

export default function EntrarPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    const result = signInPatient({ email, password })
    if (!result.ok) {
      setError(result.error || 'Não foi possível entrar.')
      return
    }

    const session = getSession()
    if (isAdmin(session)) {
      router.push('/admin/pedidos')
      return
    }
    router.push('/conta')
  }

  return (
    <main className={styles.authPage}>
      <header className={styles.authNav}>
        <nav className={styles.authNavbar}>
          <div className={styles.navGroup}>
            <div className={styles.navLinks}>
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className={styles.navItem}>
                    <span className={`${styles.navLink} ${styles.navTrigger}`}>{link.label}</span>
                    <div className={styles.navDropdown}>
                      {link.children.map((child) => (
                        <Link key={child.label} href={child.href} className={styles.navDropdownItem}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link key={link.label} href={link.href || '#'} className={styles.navLink}>
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>

          <div className={styles.authLogo}>MãeMais</div>

          <div className={`${styles.navGroup} ${styles.navGroupEnd}`}>
            <div className={styles.navActions}>
              {navActions.map((action) => (
                <Link key={action.label} href={action.href} className={styles.navButton}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <section className={`${styles.authCard} ${styles.loginCard}`}>
        <div className={styles.authHeader}>
          <p className={styles.kicker}>MãeMais</p>
          <h1>Bem-vindo</h1>
          <p className={styles.subtitle}>Preencha seus dados para continuar.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            E-mail
            <input type='email' name='email' placeholder='E-mail' required />
          </label>
          <label className={styles.label}>
            Senha
            <input type='password' name='password' placeholder='Senha' required />
          </label>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <button type='submit' className={`${styles.primaryButton} ${styles.fullWidthButton}`}>
            Entrar
          </button>

          <div className={styles.authFooterStack}>
            <Link href='#' className={styles.link}>
              Esqueceu sua senha?
            </Link>
            <span className={styles.mutedText}>Demo admin</span>
            <span className={styles.mutedText}>admin@maemais.com / 123456</span>
            <span className={styles.mutedText}>Não possui conta</span>
            <Link href='/cadastro' className={styles.link}>
              Cadastre-se aqui
            </Link>
            <span className={styles.mutedText}>Acesso médico</span>
            <Link href='/entrar-medico' className={styles.link}>
              Entrar como médico
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
