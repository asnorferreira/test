import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  BarChart3,
  CheckCircle,
  Clock,
  Instagram,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import PartnersCards from "@/components/PartnersCards"

const plans = [
  {
    name: ["Scout Free ", 
      "Experimente grátis"
    ],
    price: "R$ 0",
    period: "/mês",
    description: "Tenha acesso completo às estatísticas de um jogo por rodada. Ideal para testar a plataforma e conhecer nosso sistema de análises.",
    features: [
      "o acesso é limitado a um jogo por rodada e vinculado ao CPF, garantindo segurança e evitando múltiplos cadastros."
    ],
    cta: "Assinar Scout Free",
  },
  {
    name: ["Scout Start",
      "Estatísticas e sugestões básicas"
    ],
  price: ["R$ 49,90", "R$ 499,90"],
  period: ["/mês", "/ano (2 meses grátis)"],
    description: "Receba estatísticas completas de times e jogadores, detalhadas por tempo de jogo (HT/FT). Inclui uma sugestão de aposta por liga em cada rodada, ajudando a tomar decisões mais fundamentadas.",
    features: [
      "Tudo do Scout Free",
      "Probabilidades em tempo real",
      "Modelos de análise avançada",
      "Dashboards personalizáveis",
    ],
    cta: "Assinar Scout Start",
    highlight: true,
  },
  {
    name: ["Scout Expert", "Análise completa e insights avançados."],
    price: ["R$ 79,90", "R$ 709,90"],
    period: ["/mês", "/ano (2 meses grátis)"],
    description: "Tenha todas as estatísticas de times e jogadores, detalhadas por tempo de jogo, análise das formações e as melhoras sugestões de aposta de cada jogo. Inclui acesso a grupo exclusivo no telegram, com envio das melhores apostas da rodada.",
    features: [
      "Tudo do Scout Start",
      "Suporte dedicado 24/7",
      "Integração API em tempo real",
      "Relatórios executivos automatizados",
    ],
    cta: "Habilitar Scout Expert",

  },

   {
    name: ["Scout Telegram"
    ],
  price: ["R$ 49,90", "R$ 499,90"],
  period: ["/mês", "/ano (2 meses grátis)"],
    description: ["Receba as melhores apostas individuais e combinadas da rodada diretamente no Telegram.Prático e rápido, perfeito para quem quer apostar com base em insights selecionados por especialistas."],
    features: [
      "Receba as melhores apostas selecionadas por nossos especialistas diretamente no seu celular, incluindo sugestões individuais ecombinadas da rodada. Ideal para quem quer comodidade e praticidade, acompanhando apenas as melhores oportunidades.",
      "Preço especial apenas no checkout: R$36,90/mês"
    ],
    cta: "Assinar Scout Telegram",
    highlight: true,
  },
  
]

const testimonials = [
  {
    name: "Ana Costa",

    quote:
      "O Opta Plataform transformou a forma como preparo meus relatórios. Os dashboards são completos e muito fáceis de navegar.",
  },
  {
    name: "Bruno Lima",
  
    quote:
      "As probabilidades em tempo real e os alertas personalizados me ajudam a aproveitar cada oportunidade durante os jogos.",
  },
  {
    name: "Mariana Alves",
    
    quote:
      "Consigo levantar dados confiáveis em minutos. A plataforma é intuitiva e reúne tudo o que preciso em um só lugar.",
  },
]

const faqItems = [
  {
    question: "Como s Scout360 funciona?",
    answer:
      "A Scout360 analisa estatísticas de partidas e gera insights com base em probabilidades reais, ajudando você a tomar decisões mais fundamentadas nas apostas pré-jogo.",
  },
  {
    question: "Preciso ter experiência em apostas?",
    answer:
      "Não! Nossas análises e alertas são úteis tanto para iniciantes quanto para profissionais.",
  },
  {
    question: "Quais campeonatos são analisados?",
    answer:
      "Baseado em nossos estudos, as ligas com maior taxa de acerto foram: Premier League, La Liga, Serie A, Bundesliga, Ligue 1 e a Série B do Campeonato Brasileiro. Por isso, focamos nossos dados e análises nesses campeonatos, garantindo informações precisas e confiáveis para suas apostas. Estamos continuamente realizando estudos para incluir mais ligas no futuro.",
  },
  {
    question: "O Scout360 funciona no celular e no computador?",
    answer:
    "Sim! Nossa plataforma é totalmente responsiva e funciona em qualquer dispositivo com navegador. Além disso, temos aplicativos disponíveis para Android e iOS, para você acessar todas as análises e alertas de forma prática."
  },
  {
    question: "Quais planos estão disponíveis?",
    answer:
    "Oferecemos planos Scout Free, Start, Expert e o Scout Telegram, cada um com diferentes níveis de acesso a estatísticas, alertas e análises."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
    "Sim! Você pode cancelar seu plano a qualquer momento, sem burocracia."
  },
  {
    question:"Como funcionam os pagamentos?",
    answer:
    "Aceitamos cartões de crédito e débito, Pix e boleto bancário. Todos os pagamentos são seguros e processados automaticamente."
  },
  {
    question:"Posso sugerir melhorias ou novas funcionalidades?",
    answer:
    "Sim! Estamos sempre aprimorando a plataforma e ouvindo nossos usuários."
  }
]

const partners = [
  {
    name: "BetMaster",
    bonus: "Bônus de 20% na primeira aposta",
  },
  {
    name: "GoalWin",
    bonus: "Seguro de aposta até R$ 150",
  },
  {
    name: "Arena365",
    bonus: "Cashback semanal exclusivo",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
      {/* Header */}
      <header className="border-b border-[#1f2935] bg-[#05070d]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#05070d]" />
            </div>
            <span className="text-xl font-bold text-white">Opta Plataform</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
            O Poder das Estatísticas no
            <span className="bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] bg-clip-text text-transparent">
              {" "}
              Futebol
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto text-pretty">
            Transforme estatísticas em lucro. Descubra probabilidades calculadas, insights claros e análises. 
            <span className="bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] bg-clip-text text-transparent">
              {" "}
              Pré-jogos
            </span>
            {" "}
            que aumentam suas chances.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                <Zap className="w-5 h-5 mr-2" />
                Assinar Agora
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" className="px-8 py-3">
                Ver Recursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-20 px-4 bg-[#0a101a] border-y border-[#1f2935]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Recursos Exclusivos</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Tudo o que você precisa para transformar estatísticas em decisões certeiras nas suas apostas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#0a101a] border-[#1f2935] hover:border-primary/40 transition-colors">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-2" />
                <CardTitle className="text-white">Métricas Avançadas</CardTitle>
                <CardDescription className="text-white/70">
                  Indicadores de desempenho, consolidados em análises claras para cada partida.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#0a101a] border-[#1f2935] hover:border-primary/40 transition-colors">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle className="text-white">Análise Individual</CardTitle>
                <CardDescription className="text-white/70">
                  Dossiês completos de jogadores com estatísticas detalhadas, tendências de performance e comparativos históricos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#0a101a] border-[#1f2935] hover:border-primary/40 transition-colors">
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-2" />
                <CardTitle className="text-white">Cobertura Global</CardTitle>
                <CardDescription className="text-white/70">
                  Principais ligas e competições reunidas em uma base de dados padronizadas e confiável.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Liberte o Poder dos Dados para suas Apostas</h2>
            <p className="text-white/70 text-lg">Seja iniciante ou expert, temos o plano que se adapta ao seu jogo.</p>
          </div>

          <div className="grid gap-6 lg:gap-8 md:grid-cols-3">
            {plans.map((plan) => (
                <Card
                key={Array.isArray(plan.name) ? plan.name.join(' - ') : plan.name}
                className={( (plan.highlight && ((Array.isArray(plan.name) ? plan.name[0] : plan.name) === 'Scout Start'))
                  ? 'bg-gradient-to-br from-[#0a101a] to-[#05070d] border-[#2a3648] relative overflow-hidden'
                  : 'bg-[#0a101a] border-[#1f2935]' )}
              >
                {(plan.highlight && ((Array.isArray(plan.name) ? plan.name[0] : plan.name) === 'Scout Start')) && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d]"></div>
                )}
                <CardHeader className="text-center pb-6">
                  {(plan.highlight && ((Array.isArray(plan.name) ? plan.name[0] : plan.name) === 'Scout Start')) && (
                    <Badge className="w-fit mx-auto mb-4 bg-primary/10 text-primary border-primary/20">
                      Mais Popular
                    </Badge>
                  )}

                  <CardTitle className="text-2xl text-white">
                    {Array.isArray(plan.name) ? (
                      <span className="flex flex-col items-center">
                        <span className="font-semibold">{plan.name[0]}</span>
                        <span className="text-sm text-white/60 -mt-1">{plan.name[1]}</span>
                      </span>
                    ) : (
                      plan.name
                    )}
                  </CardTitle>
                  <p className="text-white/60 text-sm mt-2">{plan.description}</p>
                  <div className="mt-4 flex items-baseline justify-center gap-3">
                    {Array.isArray(plan.price) && Array.isArray(plan.period) ? (
                      <div className="text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-4xl md:text-5xl font-bold text-white whitespace-nowrap">
                            <span className="mr-2">{plan.price[0]}</span>
                            <span className="text-white/60 text-sm md:text-sm">{plan.period[0]}</span>
                          </div>
                          <div className="mt-2 text-2xl md:text-3xl font-semibold text-white whitespace-nowrap">
                            <span className="mr-2">{plan.price[1]}</span>
                            <span className="text-white/60 text-sm md:text-sm">{plan.period[1]}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-white/60">{plan.period}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-white/80 text-left">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" className="block w-full mt-6">
                    <Button className="w-full py-3">{plan.cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 border-t border-[#1f2935]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Depoimentos</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Profissionais do mercado contam como o Opta Plataform potencializou suas decisões
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-[#0a101a] border-[#1f2935]">
                <CardContent className="p-6 space-y-4">
                  <p className="text-white/80 italic">“{testimonial.quote}”</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src="/generic-player-avatar.png"
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-[#2a3648]"
                    />
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
    
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="perguntas" className="py-20 px-4 bg-[#0a101a] border-y border-[#1f2935]">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Respostas rápidas para você aproveitar o máximo da plataforma
            </p>
          </div>

          <Card className="bg-[#0a101a] border-[#1f2935]">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${index}`}
                    className="border border-[#1f2935] rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left text-white">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/70">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bonus Partners (replaced by component) */}
      <PartnersCards />

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#05070d]">
        <div className="container mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#05070d]" />
              </div>
              <span className="text-lg font-semibold text-white">Opta Plataform</span>
            </div>
            <div className="flex items-center space-x-6 text-white/70">
              <Link href="#perguntas" className="hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Termos
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacidade
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-white/80">
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-white">@opta.plataform</p>
                <p className="text-sm text-white/60">Siga nossos insights diários</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-white">Horário de atendimento</p>
                <p className="text-sm text-white/60">Seg a Dom · 08h às 22h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-white">Contato</p>
                <p className="text-sm text-white/60">contato@sportstats.pro</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-white">Central</p>
                <p className="text-sm text-white/60">+55 (11) 4000-2025</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1f2935] pt-6 text-center text-white/60 text-sm">
            <p>&copy; 2025 Opta Plataform. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

