'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../page.module.css'
import { useAuth } from '@/modules/auth/hooks/useAuth'

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

const planLinks = [
  { label: 'Gerenciar planos e pedidos', href: '#', icon: '📦' },
  { label: 'Histórico de pedidos', href: '#', icon: '🕑' },
  { label: 'Documentos do tratamento', href: '#', icon: '📄' },
  { label: 'Indique uma amiga', href: '#', icon: '🎁' },
]

const accountLinks = [
  { label: 'Faturamento e pagamentos', href: '#', icon: '💳' },
  { label: 'Detalhes da conta', href: '#', icon: '🧾' },
  { label: 'Carteira', href: '#', icon: '👛' },
]

export default function PerfilPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <nav className={styles.topNavbar}>
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
          <div className={styles.topLogo}>MãeMais</div>
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

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            <Link href='/conta' className={styles.menuItem}>
              <span className={styles.menuIcon}>🏠</span>
              <span>Início</span>
            </Link>
            <Link href='/conta/suporte' className={styles.menuItem}>
              <span className={styles.menuIcon}>💬</span>
              <span>Suporte</span>
            </Link>
            <Link href='/conta/evolucao' className={styles.menuItem}>
              <span className={styles.menuIcon}>📈</span>
              <span>Evolução</span>
            </Link>
            <Link href='/conta/perfil' className={`${styles.menuItem} ${styles.active}`}>
              <span className={styles.menuIcon}>👤</span>
              <span>Conta</span>
            </Link>
          </nav>
        </aside>

        <section className={styles.content}>
          <header className={styles.supportHeader}>
            <h1>Conta</h1>
            <p>Gerencie seu plano MilkMais, pagamentos e dados de acesso.</p>
          </header>

          <article className={styles.accountCard}>
            <h3>Planos</h3>
            <div className={styles.accountList}>
              {planLinks.map((item) => (
                <Link key={item.label} href={item.href} className={styles.accountItem}>
                  <div className={styles.accountItemLeft}>
                    <span className={styles.accountIcon}>{item.icon}</span>
                    <span className={styles.accountLabel}>{item.label}</span>
                  </div>
                  <span className={styles.linkButton} aria-hidden>
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>

            <h3>Conta</h3>
            <div className={styles.accountList}>
              {accountLinks.map((item) => (
                <Link key={item.label} href={item.href} className={styles.accountItem}>
                  <div className={styles.accountItemLeft}>
                    <span className={styles.accountIcon}>{item.icon}</span>
                    <span className={styles.accountLabel}>{item.label}</span>
                  </div>
                  <span className={styles.linkButton} aria-hidden>
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>

            <div className={styles.logoutRow}>
              <button
                type='button'
                className={styles.logoutLink}
                onClick={() => {
                  signOut()
                  router.push('/entrar')
                }}
              >
                Sair da conta
              </button>
              <span className={styles.logoutIcon} aria-hidden>
                ↪
              </span>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
