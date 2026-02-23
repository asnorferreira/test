'use client'

import Link from 'next/link'
import styles from '../page.module.css'

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

export default function EvolucaoPage() {
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
            <Link href='/conta/evolucao' className={`${styles.menuItem} ${styles.active}`}>
              <span className={styles.menuIcon}>📈</span>
              <span>Evolução</span>
            </Link>
            <Link href='/conta/perfil' className={styles.menuItem}>
              <span className={styles.menuIcon}>👤</span>
              <span>Conta</span>
            </Link>
          </nav>
        </aside>

        <section className={styles.content}>
          <header className={styles.supportHeader}>
            <h1>Evolução</h1>
            <p>
              Acompanhe sua jornada de amamentação com segurança: fotos, registros e observações
              para você e seu especialista.
            </p>
          </header>

          <div className={styles.sectionTitleRow}>
            <h2>Produção de leite</h2>
            <Link href='#' className={styles.linkInline}>
              Ver evolução &rarr;
            </Link>
          </div>
          <article className={styles.supportCard}>
            <div className={styles.progressPanel}>
              <div className={styles.progressIllustration} aria-hidden>
                <div className={styles.progressAvatar}>MM</div>
              </div>
              <button className={styles.primaryButton}>Adicionar fotos</button>
            </div>
          </article>

          <div className={styles.sectionTitleRow}>
            <h2>Evolução da amamentação</h2>
            <Link href='#' className={styles.linkInline}>
              Ver evolução &rarr;
            </Link>
          </div>
          <article className={styles.supportCard}>
            <div className={styles.progressRow}>
              <div>
                <p className={styles.progressItemTitle}>Acompanhe sua evolução</p>
                <span className={styles.progressItemDesc}>Nenhum registro ainda.</span>
              </div>
              <button className={styles.linkButton} aria-label='Ver detalhes da evolução'>
                &rarr;
              </button>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
