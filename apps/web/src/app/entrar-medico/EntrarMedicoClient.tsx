'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { MOCK_DOCTOR_CREDENTIALS, signInDoctor } from '@/modules/auth/services/auth.api'

export default function EntrarMedicoClient({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    const result = signInDoctor({ email, password })
    if (!result.ok) {
      setError(result.error || 'Credenciais inválidas.')
      return
    }

    router.push(nextPath)
  }

  return (
    <main className={styles.authPage}>
      <header className={styles.authNav}>
        <nav className={styles.authNavbar}>
          <div className={styles.navGroup} />
          <Link href='/' className={styles.authLogo}>
            MãeMais
          </Link>
          <div className={`${styles.navGroup} ${styles.navGroupEnd}`}>
            <div className={styles.navActions}>
              <Link href='/entrar' className={styles.navButton}>
                Login paciente
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <section className={`${styles.authCard} ${styles.loginCard}`}>
        <div className={styles.authHeader}>
          <p className={styles.kicker}>Acesso médico</p>
          <h1>Entrar</h1>
          <p className={styles.subtitle}>Use o login mockado para acessar o fluxo médico.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            E-mail
            <input
              type='email'
              name='email'
              placeholder='E-mail'
              defaultValue={MOCK_DOCTOR_CREDENTIALS.email}
              required
            />
          </label>
          <label className={styles.label}>
            Senha
            <input
              type='password'
              name='password'
              placeholder='Senha'
              defaultValue={MOCK_DOCTOR_CREDENTIALS.password}
              required
            />
          </label>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <button type='submit' className={`${styles.primaryButton} ${styles.fullWidthButton}`}>
            Entrar como médico
          </button>

          <div className={styles.authFooterStack}>
            <span className={styles.mutedText}>
              Demo: {MOCK_DOCTOR_CREDENTIALS.email} / {MOCK_DOCTOR_CREDENTIALS.password}
            </span>
          </div>
        </form>
      </section>
    </main>
  )
}

