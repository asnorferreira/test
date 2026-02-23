'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import styles from './page.module.css'

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

const benefitHighlights = [
  {
    title: 'Formula artesanal e segura',
    text: 'MaeMais e homeopatica, feita sob medida para cada mae, sem efeitos colaterais para voce ou o bebe.',
    icon: '🌿',
  },
  {
    title: 'Acompanhamento de especialistas',
    text: 'Rede de consultoras, nutricao e medicos parceiros para acompanhar a producao de leite e seu bem-estar.',
    icon: '🤝',
  },
  {
    title: 'Planos flexiveis',
    text: 'Ajuste, acelere ou pause sempre que precisar. O cuidado respeita o ritmo da sua maternidade real.',
    icon: '🧭',
  },
  {
    title: 'Entrega confortavel',
    text: 'Receba em casa com discrecao e sem burocracia, com suporte disponivel 7 dias por semana.',
    icon: '🚚',
  },
]

const featureDetails = [
  {
    title: 'Escuta acolhedora',
    text: 'Conte sua rotina, duvidas e desafios com consultoras que entendem o pos-parto. Sem julgamentos, so apoio real.',
    image:
      'https://img.freepik.com/fotos-gratis/jovem-terna-feliz-mae-abracando-seu-bebe-recem-nascido-sorrindo-sentado-na-cama-pela-manha_176420-14057.jpg?semt=ais_hybrid&w=740&q=80',
  },
  {
    title: 'Formula MaeMais',
    text: 'Homeopatia 100% artesanal, feita para aumentar a producao de leite com seguranca e transparencia nos ingredientes.',
    image:
      'https://acdn-us.mitiendanube.com/stores/006/300/998/products/formula-ca88f1d94e2f8c767917491337436168-640-0.webp',
  },
  {
    title: 'Cuidado continuo',
    text: 'Ajustes de dosagem, dicas de autocuidado e suporte emocional para voce amamentar com confianca.',
    image:
      'https://s2.glbimg.com/-FGZoOKtgrLsNV0MSplKp-k0-hA=/620x450/e.glbimg.com/og/ed/f/original/2016/01/14/mae-bebe-sorrisos.jpg',
  },
]

const planOptions = [
  {
    title: 'Plano Completo MaeMais',
    description:
      'Avaliacao acolhedora, formula personalizada, entregas recorrentes e suporte continuo com consultoras de amamentacao.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJX5GLTNB4bO2Ko3rAAszJHYcb6IJLjsy1BA&s',
    primary: true,
  },
  {
    title: 'Consulta Avulsa',
    description: 'Converse com uma especialista para organizar sua rotina de amamentacao e tirar duvidas pontuais.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaPBWNiMdx9gVQQdZWX9S1BUkIkpnbZIwUPQ&s',
    icon: '🗓️',
  },
  {
    title: 'Farmacia Parceira',
    description: 'Ja tem receita? Peca a MaeMais diretamente pela nossa rede artesanal com envio seguro e discreto.',
    image: 'https://ictq.com.br/images/Redes_de_farm%C3%A1cias_registram_retra%C3%A7%C3%A3o_de_22_em_abril.jpg',
    icon: '🧴',
  },
]

const treatmentCards = [
  {
    title: 'Aumentar producao de leite',
    text: 'Formula MaeMais + orientacoes praticas para estimular a producao de forma natural.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvgAqMhIcZlMB3QyqphptGVkY51ueoKlYs2A&s',
  },
  {
    title: 'Autocuidado pos-parto',
    text: 'Roteiro de descanso, hidratacao, alimentacao e apoio emocional para uma amamentacao leve.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoVH4Uf7_7z9ouMRSKwmZOXEEmniALNSif0g&s',
  },
  {
    title: 'Rede de apoio',
    text: 'Consultoras e especialistas disponiveis para ajustar o plano e acolher suas duvidas.',
    image: 'https://i0.wp.com/blog.dietbox.me/wp-content/uploads/2020/06/Rede-de-apoio.png?fit=910%2C480&ssl=1',
  },
]

const testimonials = [
  {
    name: 'Patricia M.',
    quote:
      'Voltei a produzir com seguranca e sem efeitos colaterais. O suporte humano fez toda a diferenca nos primeiros meses.',
  },
  {
    name: 'Juliana R.',
    quote:
      'A consultora me ouviu sem julgamentos e ajustou a formula para minha rotina. Me senti acolhida e confiante.',
  },
  {
    name: 'Carolina A.',
    quote:
      'A entrega foi rapida, a explicacao transparente e consegui amamentar com mais tranquilidade.',
  },
  {
    name: 'Bianca S.',
    quote:
      'Os conteudos e o acompanhamento me ajudaram a lidar com a inseguranca de primeira viagem.',
  },
]

const guideCards = [
  {
    topic: 'Amamentacao',
    title: 'Passos praticos para aumentar a producao de leite',
    author: 'Equipe MaeMais',
    image: 'https://images.squarespace-cdn.com/content/v1/5e827741522ae05d82b65749/1593037809238-OTBCCL8OY1YDF89TMNZZ/UACUIDA_REFLEXO_PROLACTINA.jpg',
  },
  {
    topic: 'Pos-parto real',
    title: 'Autocuidado e sono: como cuidar de voce para cuidar do bebe',
    author: 'Consultoras convidadas',
    image: 'https://uniquebaby.com.br/wp-content/uploads/2023/07/recuperacao-pos-parto.jpg',
  },
  {
    topic: 'Nutricao',
    title: 'Alimentacao que apoia a amamentacao sem complicacao',
    author: 'Time de nutricao',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm_RzxTxRKsC8YNFrVS4XCSfBsYXHvMaMgfg&s',
  },
  {
    topic: 'Bem-estar emocional',
    title: 'Lidando com a inseguranca e a culpa no pos-parto',
    author: 'Psicologia perinatal',
    image: 'https://media.unimedcampinas.com.br/2d7c04cb-9477-4c99-8800-f39e8c0cce1e',
  },
]

const footerSupport = [
  { label: 'Central de apoio', description: 'Respostas rapidas para o seu dia a dia.' },
  { label: 'Fale com uma consultora', description: 'Acolhimento humano para tirar duvidas.' },
]

const footerTratamentos = [
  'Aumentar producao de leite',
  'Autocuidado pos-parto',
  'Suporte emocional',
]

const footerLinks = ['Home', 'Quem somos', 'Perguntas frequentes', 'Politica de privacidade']

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isTreatmentsOpen, setIsTreatmentsOpen] = useState(false)

  const treatmentsMenu = [
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

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return

    const { clientWidth, scrollLeft } = sliderRef.current
    const offset = clientWidth * 0.8
    const target = direction === 'left' ? Math.max(0, scrollLeft - offset) : scrollLeft + offset

    sliderRef.current.scrollTo({ left: target, behavior: 'smooth' })
  }

  return (
    <main className={styles.page}>
      <nav className={styles.navbar}>
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

        <Link href='/' className={styles.logo}>
          MaeMais
        </Link>

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

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.pill}>Formula 100% artesanal</span>
            <h1 className={styles.heroHeadline}>
              Apoio completo para uma amamentacao leve, produtiva e segura.
            </h1>
            <p className={styles.secondaryText}>
              MaeMais e uma formula homeopatica criada para maes que querem aumentar a producao de
              leite com tranquilidade. Cuidamos da sua saude fisica e emocional, fortalecendo o
              vinculo com o bebe.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton}>Comecar agora</button>
              <button className={styles.secondaryButton}>Falar com uma consultora</button>
            </div>
            <p className={styles.supportText}>Segura para mae. Gentil para o bebe.</p>
          </div>

          <div className={styles.heroImageWrapper}>
            <img
              className={styles.heroImage}
              src='https://us.123rf.com/450wm/andriiborodai/andriiborodai2108/andriiborodai210800041/172797709-m%C3%A3e-segurando-uma-crian%C3%A7a-alegre-em-seus-bra%C3%A7os-ao-ar-livre.jpg?ver=6'
              alt='Mae sorrindo segurando o bebe'
            />
          </div>
        </div>
      </section>

      <section className={styles.benefits}>
        <div className={styles.benefitGrid}>
          {benefitHighlights.map((benefit) => (
            <article key={benefit.title} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{benefit.icon}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.features}>
        <header className={styles.featuresHeader}>
          <h2>O jeito mais pratico de cuidar da sua amamentacao</h2>
          <p>
            Planos flexiveis, acompanhamento proximo e conteudos claros para apoiar sua producao de
            leite e seu bem-estar todos os dias.
          </p>
        </header>
        <div className={styles.featureGrid}>
          {featureDetails.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureContent}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
              <div className={styles.featureImageWrapper}>
                <img src={feature.image} alt={feature.title} className={styles.featureImage} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.treatments}>
        <header className={styles.treatmentsHeader}>
          <p className={styles.treatmentsLabel}>Planos MaeMais</p>
          <h2>Protocolos naturais e personalizados para voce e seu bebe</h2>
        </header>
        <div className={styles.treatmentGrid} id='producao'>
          {treatmentCards.map((treatment) => (
            <article key={treatment.title} className={styles.treatmentCard}>
              <div className={styles.treatmentImageWrapper}>
                <img src={treatment.image} alt={treatment.title} className={styles.treatmentImage} />
              </div>
              <div className={styles.treatmentContent}>
                <h3>{treatment.title}</h3>
                <p>{treatment.text}</p>
                <button className={styles.treatmentButton}>Conhecer plano</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className={styles.testimonialHeaderRow}>
          <header className={styles.sectionHeader}>
            <h2>O que as maes dizem</h2>
          </header>
          <div className={styles.sliderControls}>
            <button
              className={styles.sliderButton}
              type='button'
              aria-label='Voltar depoimentos'
              onClick={() => scrollTestimonials('left')}
            >
              {'<'}
            </button>
            <button
              className={styles.sliderButton}
              type='button'
              aria-label='Avancar depoimentos'
              onClick={() => scrollTestimonials('right')}
            >
              {'>'}
            </button>
          </div>
        </div>
        <div className={styles.testimonialSliderWrapper}>
          <div ref={sliderRef} className={styles.testimonialSlider}>
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className={styles.testimonialCard}>
                <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                <p>{testimonial.quote}</p>
                <strong>{testimonial.name}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id='sobre' className={styles.about}>
        <div className={styles.aboutContent}>
          <p className={styles.sectionLabel}>Sobre a MaeMais</p>
          <h2>Cuidado completo e descomplicado para a amamentacao</h2>
          <p>
            Missao: proporcionar as maes uma amamentacao mais leve, produtiva e segura. Visao: ser
            referencia no apoio as maes com solucoes naturais, eficazes e acolhedoras. Valores:
            seguranca, empatia, transparencia, acolhimento, inovacao com proposito, responsabilidade
            e resultados reais.
          </p>
        </div>
        <div className={styles.planGrid}>
          {planOptions.map((plan) => (
            <article
              key={plan.title}
              className={`${styles.planCard} ${plan.primary ? styles.planCardPrimary : ''}`}
            >
              {plan.image ? (
                <div className={styles.planImageWrapper}>
                  <img src={plan.image} alt={plan.title} className={styles.planImage} />
                </div>
              ) : (
                <span className={styles.planIcon}>{plan.icon}</span>
              )}
              <div className={styles.planBody}>
                <h3>{plan.title}</h3>
                <p>{plan.description}</p>
                <button className={styles.planButton}>
                  {plan.primary ? 'Comecar avaliacao' : 'Comecar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.guides} id='guia'>
        <header className={styles.guidesHeader}>
          <p className={styles.sectionLabel}>Meu Milk Mais</p>
          <h2>Guias pessoais de saude, informacao e acolhimento para o seu ciclo de amamentacao</h2>
        </header>
        <div className={styles.guideGrid}>
          {guideCards.map((guide) => (
            <article key={guide.title} className={styles.guideCard}>
              <div className={styles.guideText}>
                <small>{guide.topic}</small>
                <h3>{guide.title}</h3>
                <span>{guide.author}</span>
              </div>
              <div className={styles.guideImageWrapper}>
                <img src={guide.image} alt={guide.title} className={styles.guideImage} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerColumn}>
            <p className={styles.footerLabel}>Ficou alguma duvida?</p>
            <ul className={styles.footerList}>
              {footerSupport.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerLabel}>Solucoes MaeMais</p>
            <ul className={styles.footerLinks}>
              {footerTratamentos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerLabel}>Mae Mais</p>
            <ul className={styles.footerLinks}>
              {footerLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footerDivider} />

        <div className={styles.footerBottom}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>MaeMais</div>
            <p>
              Formula homeopatica artesanal, segura para a mae e gentil para o bebe. Acolhimento,
              transparencia e apoio continuo em cada fase da amamentacao.
            </p>
          </div>
          <div className={styles.footerActions}>
            <button className={styles.footerButton}>Falar com especialista</button>
            <div className={styles.footerSocial}>
              <span aria-label='Facebook' role='img'>
                f
              </span>
              <span aria-label='Instagram' role='img'>
                ig
              </span>
            </div>
          </div>
        </div>

        <div className={styles.footerNote}>
          <p>© {new Date().getFullYear()} MaeMais. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  )
}
