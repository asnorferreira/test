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

const supportChannels = [
  { label: 'Central de ajuda', description: 'Acesse respostas rápidas sobre cadastro, plano e entregas.', action: 'Abrir' },
  { label: 'Whatsapp', description: 'Fale com nosso time de acolhimento e suporte.', action: 'Conversar' },
  { label: 'Chat em tempo real', description: 'Receba ajuda imediata sobre seu plano MilkMais.', action: 'Iniciar' },
]

export default function SuportePage() {
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
            <Link href='/conta/suporte' className={`${styles.menuItem} ${styles.active}`}>
              <span className={styles.menuIcon}>💬</span>
              <span>Suporte</span>
            </Link>
            <Link href='/conta/evolucao' className={styles.menuItem}>
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
            <h1>Suporte</h1>
            <p>Estamos aqui para deixar sua amamentação mais leve, segura e acolhedora.</p>
          </header>

          <article className={styles.supportCard}>
            <div className={styles.supportHeading}>
              <h2>Ajuda com cadastro, plano e entregas</h2>
              <p>
                Tire dúvidas sobre assinatura MilkMais, cadastro, pagamentos e logística. Nosso time
                garante um cuidado sem atritos para você focar no vínculo com o bebê.
              </p>
            </div>

            <div className={styles.supportList}>
              {supportChannels.map((channel) => (
                <div key={channel.label} className={styles.supportItem}>
                  <div>
                    <p className={styles.supportItemTitle}>{channel.label}</p>
                    <span className={styles.supportItemDesc}>{channel.description}</span>
                  </div>
                  <button className={styles.supportAction}>{channel.action}</button>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.supportCard}>
            <div className={styles.supportHeading}>
              <h2>Dúvidas clínicas sobre amamentação</h2>
              <p>
                Fale com especialistas sobre uso da fórmula MilkMais, ajustes de dose, efeitos e
                autocuidado materno. Suporte seguro para você e gentil para o bebê.
              </p>
            </div>

            <div className={styles.supportList}>
              <div className={styles.supportItem}>
                <div>
                  <p className={styles.supportItemTitle}>Mensagens</p>
                  <span className={styles.supportItemDesc}>Converse com uma especialista.</span>
                </div>
                <button className={styles.supportAction}>Enviar</button>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
