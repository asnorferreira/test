import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FAQPage() {
  const faqs = [
    {
      question: "Como o Scout360 funciona?",
      answer:
        "A Scout 360 analisa estatísticas de partidas e gera insights com base em probablidades reais, ajudando você a tomar decisões mais fundamentadas nas apostas pré-jogo.",
    },
    {
      question: "Preciso ter experiência em apostas?",
      answer:
        "Não! Nossas análises e alertas são úteis tanto para iniciantes quanto para profissionais.",
    },
    {
      question: "Quais campeonatos são analisados?",
      answer:
        "Baseado em nossos estudos, as ligas com maior taxa de acerto foram: Premier League, La Liga, Serie A, Bundesliga, Ligue 1 e a Série B do Campeonato Brasileiro. Por isso, focamos nossos dados e análises nesses campeonatos, garantindo informações precisas e confiáveis para suas apostas. Estamos continuamente realizando estudos para incluir mais ligas no futuro",
    },
    {
      question: "O Scout360 funciona no celular e no computador?",
      answer:
        "Sim! Nossa plataforma é totalmente responsiva e funciona em qualquer dispositivo com navegador. Além disso, temos aplicativos disponíveis para Android e iOS, para você acessar todas as análises e alertas de forma prática.",
    },
    {
      question: "Quais planos estão disponíveis?",
      answer:
        "Oferecemos planos Scout Free, Start, Expert e o Scout Telegram, cada um com diferentes níveis de acesso a estatísticas, alertas e análises.",
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer:
        "Sim! Você pode cancelar seu plano a qualquer momento, sem burocracia.",
    },
    {
      question: "Como funcionam os pagamentos?",
      answer:
        "Aceitamos cartões de crédito, débito, Pix e boleto bancário. Todos os pagamentos são seguros e processados automaticamente.",
    },
    {
      question: "Posso sugerir melhorias ou novas funcionalidades?",
      answer:
        "Sim! Estamos sempre aprimorando a plataforma e ouvindo nossos usuários.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05070d] via-[#0a101a] to-[#05070d]">
      {/* Header */}
      <header className="border-b border-[#1f2935] bg-[#05070d]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#f0c85c] to-[#d19c2d] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#05070d]" />
            </div>
            <span className="text-xl font-bold text-white">Opta Plataform</span>
          </Link>
          <Link href="/">
            <Button size="lg" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Perguntas Frequentes</h1>
            <p className="text-white text-lg">
              Encontre respostas para as dúvidas mais comuns sobre nossa plataforma
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card className="bg-[#0a101a] border-[#1f2935]">
            <CardHeader>
              <CardTitle className="text-white">Dúvidas Gerais</CardTitle>
              <CardDescription className="text-white">
                Clique nas perguntas abaixo para ver as respostas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-[#1f2935]">
                    <AccordionTrigger className="text-white hover:text-primary text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-white leading-relaxed">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-[#0a101a] to-[#101a2b] border-[#2a3648]">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold text-white mb-4">Não encontrou sua resposta?</h3>
                <p className="text-white mb-6">Nossa equipe de suporte está pronta para ajudar você</p>
                <Link href="/signup">
                  <Button size="lg">Falar com Suporte</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

