'use client'

import Link from 'next/link'
import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'

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

export default function CadastroPage() {
  const router = useRouter()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

      <section className={`${styles.authCard} ${styles.signupCard}`}>
        <div className={styles.authHeader}>
          <p className={styles.kicker}>MãeMais</p>
          <h1>Primeira vez aqui?</h1>
          <p className={styles.subtitle}>
            Crie seu login e saiba o melhor tratamento para sua queda capilar. Todo contato com o
            médico será feito através do e-mail.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <label className={styles.label}>
              Nome
              <input type='text' name='nome' placeholder='Nome' required />
            </label>
            <label className={styles.label}>
              Sobrenome
              <input type='text' name='sobrenome' placeholder='Sobrenome' required />
            </label>
          </div>

          <label className={styles.label}>
            E-mail
            <input type='email' name='email' placeholder='seuemail@email.com' required />
          </label>

          <label className={styles.label}>
            Data de nascimento
            <input type='text' name='dataNascimento' placeholder='DD/MM/AAAA' inputMode='numeric' />
          </label>

          <label className={`${styles.label} ${styles.hasError}`}>
            Whatsapp
            <input type='tel' name='whatsapp' placeholder='(11) 99999-9999' required />
            <span className={styles.errorText}>Campo obrigatório</span>
            <span className={styles.helperText}>
              Nosso time de suporte poderá entrar em contato pelo WhatsApp.
            </span>
          </label>

          <label className={styles.label}>
            Senha
            <input type='password' name='password' placeholder='Crie uma senha' required />
          </label>

          <div className={styles.checkboxList}>
            <label className={styles.checkboxItem}>
              <input type='checkbox' name='termos' required />
              <span>
                Eu concordo com os <a href='#'>Termos &amp; Condições</a> e{' '}
                <a href='#'>Política de Privacidade</a>
              </span>
            </label>

            <label className={styles.checkboxItem}>
              <input type='checkbox' name='dados' />
              <span>
                Eu concordo com a coleta e tratamento dos meus dados conforme{' '}
                <a href='#'>Política de Proteção de Dados</a>
              </span>
            </label>

            <label className={styles.checkboxItem}>
              <input type='checkbox' name='ofertas' />
              <span>Tenha acesso exclusivo a brindes, descontos e ofertas especiais</span>
            </label>
          </div>

          <button type='submit' className={`${styles.primaryButton} ${styles.fullWidthButton}`}>
            Continuar
          </button>

          <div className={styles.formDivider} />

          <div className={styles.authFooter}>
            <span>Já tem uma conta?</span>
            <Link href='/entrar' className={styles.link}>
              Clique aqui para entrar
            </Link>
          </div>

          <p className={styles.disclaimer}>
            Este site é protegido pelo reCAPTCHA; os termos de privacidade e termos de serviço do
            Google se aplicam.
          </p>
        </form>
      </section>
    </main>
  )
}
