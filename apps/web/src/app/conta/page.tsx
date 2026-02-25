'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'
import { listPatientNotifications, markNotificationRead, type PatientNotification } from '@/modules/doctor/services/cases.store'

type TreatmentsSection = {
  title: string
  items: string[]
  subtitles?: Record<string, string>
}
const navLinks = [
  {
    label: 'Tratamentos',
    children: [
      { label: 'Producao de leite', href: '#producao' },
      { label: 'Amamentacao sem dor', href: '#autocuidado' },
      { label: 'Sono e descanso', href: '#sono' },
      { label: 'Bem-estar emocional', href: '#bemestar' },
    ],
  },
  { label: 'Guia', href: '#guia' },
  { label: 'Blog', href: '#blog' },
]
const navActions = [
  { label: 'Quem somos', href: '#sobre' },
  { label: 'Minha jornada', href: '/conta' },
]

const treatmentsMenu : TreatmentsSection[] = [
  {
    title: 'Tratamentos MaeMais',
    items: [
      'Aumento de producao de leite',
      'Amamentacao sem dor',
      'Sono e descanso',
      'Equilibrio emocional',
    ],
    subtitles: {
      'Aumento de producao de leite': 'Formula personalizada com ajuste de dosagem e rotina orientada.',
      'Amamentacao sem dor': 'Hidratacao, posicoes e acompanhamento continuo para evitar fissuras.',
    },
  },
  {
    title: 'Conta',
    items: ['Minha jornada', 'Consultas agendadas'],
    subtitles: {
      'Consultas agendadas': 'Veja datas, ajuste horarios e fale com a consultora responsavel.',
    },
  },
  {
    title: 'Suporte',
    items: ['Central de apoio', 'Fale com uma consultora'],
    subtitles: {
      'Fale com uma consultora': 'Acolhimento em tempo real para duvidas urgentes.',
    },
  },
  {
    title: 'Conteudo',
    items: ['Guia da amamentacao', 'Perguntas frequentes'],
  },
]

const goals = [
  { title: 'Producao de leite', status: 'Acompanhamento ativo', icon: 'PL' },
  { title: 'Amamentacao sem dor', status: 'Sem plano ativo', icon: 'AC' },
  { title: 'Sono e descanso', status: 'Sem plano ativo', icon: 'ZZ' },
  { title: 'Bem-estar emocional', status: 'Sem plano ativo', icon: 'BE' },
]

export default function ContaPage() {
  const [isTreatmentsOpen, setIsTreatmentsOpen] = useState(false)
  const patientId = 'p-001'
  const [notifications, setNotifications] = useState<PatientNotification[]>([])

  useEffect(() => {
    setNotifications(listPatientNotifications(patientId))
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <nav className={styles.topNavbar}>
          <div className={styles.navGroup}>
            <div className={styles.navLinks}>
              {navLinks.map((link) =>
                link.label === 'Tratamentos' ? (
                  <button
                    key={link.label}
                    type='button'
                    className={`${styles.navLink} ${styles.navTrigger} ${styles.navButtonLike}`}
                    onClick={() => setIsTreatmentsOpen(true)}
                  >
                    {link.label}
                  </button>
                ) : link.children ? (
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
          <Link href='/' className={styles.topLogo}>MãeMais</Link>
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

      <div
        className={`${styles.sidebarOverlay} ${isTreatmentsOpen ? styles.isOpen : ''}`}
        onClick={() => setIsTreatmentsOpen(false)}
      >
        <aside className={styles.sidebarPanel} onClick={(event) => event.stopPropagation()}>
          <button
            type='button'
            className={styles.sidebarClose}
            aria-label='Fechar menu de tratamentos'
            onClick={() => setIsTreatmentsOpen(false)}
          >
            x
          </button>

          {treatmentsMenu.map((section) => (
            <div key={section.title} className={styles.sidebarSection}>
              <p className={styles.sidebarSectionTitle}>{section.title}</p>
              <ul className={styles.sidebarList}>
                {section.items.map((item) => (
                  <li key={item} className={styles.sidebarItem}>
                    <div>
                      <span className={styles.sidebarItemLabel}>{item}</span>
                      {section.subtitles?.[item] ? (
                        <small className={styles.sidebarSubtitle}>{section.subtitles[item]}</small>
                      ) : null}
                    </div>
                    <span className={styles.sidebarItemArrow}>{'>'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            <Link href='/conta' className={`${styles.menuItem} ${styles.active}`}>
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
            <Link href='/conta/perfil' className={styles.menuItem}>
              <span className={styles.menuIcon}>👤</span>
              <span>Conta</span>
            </Link>
          </nav>
        </aside>

        <section className={styles.content}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>Plano MilkMais ativo</p>
              <h1>Bom dia, Maria!</h1>
            </div>
            <div className={styles.balance}>
              <span className={styles.balanceLabel}>Saldo de bônus</span>
              <strong>R$ 150</strong>
            </div>
          </header>

          <div className={styles.cardsGrid}>
            {notifications.length ? (
              <article className={`${styles.card} ${styles.notificationCard}`}>
                <div className={styles.cardContent}>
                  <div className={styles.notificationBadge}>
                    {unreadCount ? `${unreadCount} nova${unreadCount > 1 ? 's' : ''}` : 'Notificações'}
                  </div>
                  <div className={styles.notificationBody}>
                    <p className={styles.notificationTitle}>Atualização do seu caso</p>
                    <p className={styles.notificationText}>{notifications[0].message}</p>
                    {!notifications[0].read ? (
                      <button
                        type='button'
                        className={styles.notificationAction}
                        onClick={() => {
                          markNotificationRead(notifications[0].id)
                          setNotifications(listPatientNotifications(patientId))
                        }}
                      >
                        Marcar como lida
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ) : null}

            <article className={`${styles.card} ${styles.successCard}`}>
              <div className={styles.cardContent}>
                <div className={styles.badge}>Tudo certo!</div>
                <p className={styles.cardText}>
                  Nenhuma tarefa no momento. Siga sua rotina de amamentação com tranquilidade.
                </p>
              </div>
            </article>

            <article className={`${styles.card} ${styles.referCard}`}>
              <div className={styles.referCopy}>
                <p className={styles.referTitle}>Indique uma amiga</p>
                <p className={styles.referHighlight}>Você ganha R$150. Sua amiga leva 40% off.</p>
                <p className={styles.referText}>
                  Vocês duas recebem cuidado MilkMais para uma amamentação segura e acolhedora.
                </p>
                <button className={styles.referButton}>Indicar agora</button>
              </div>
              <div className={styles.referIllustration} aria-hidden>
                MM
              </div>
            </article>
          </div>

          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2>Metas do cuidado MilkMais</h2>
            </header>
            <div className={`${styles.card} ${styles.goalCard}`}>
              <div>
                <p className={styles.goalTitle}>Producao de leite</p>
                <p className={styles.goalStatus}>Acompanhamento ativo</p>
              </div>
              <button className={styles.linkButton} aria-label='Ver detalhes de queda de cabelo'>
                &rarr;
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <header className={styles.sectionHeader}>
              <h2>Adicionar uma nova meta</h2>
            </header>
            <div className={styles.goalGrid}>
              {goals.map((goal) => (
                <article key={goal.title} className={styles.goalTile}>
                  <p className={styles.goalTileTitle}>{goal.title}</p>
                  <span className={styles.goalTileStatus}>{goal.status}</span>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}


