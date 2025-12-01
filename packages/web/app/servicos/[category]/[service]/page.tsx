import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react"

import { Button } from "@/packages/web/components/ui/button"
import { Card } from "@/packages/web/components/ui/card"
import { serviceCategories, servicesFlat } from "@/packages/web/lib/services-data"

interface ServicePageProps {
  params: {
    category: string
    service: string
  }
}

export function generateStaticParams() {
  return servicesFlat.map((service) => ({
    category: service.categoryId,
    service: service.slug,
  }))
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  const service = servicesFlat.find(
    (item) => item.categoryId === params.category && item.slug === params.service,
  )

  if (!service) {
    return {
      title: "Serviço não encontrado | JSP Serviços",
      description: "O serviço solicitado não está disponível.",
    }
  }

  return {
    title: `${service.name} | ${service.categoryTitle} | JSP Serviços`,
    //description: service.shortDescription,
  }
}

export default function ServiceDetailPage({ params }: ServicePageProps) {
  const category = serviceCategories.find((item) => item.id === params.category)
  const service = category?.services.find((item) => item.slug === params.service)

  if (!category || !service) {
    notFound()
  }

  const { detail } = service
  const relatedServices = category.services.filter((item) => item.slug !== service.slug).slice(0, 3)

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src={detail.heroImage}
            alt={`Equipe JSP atuando em ${service.name.toLowerCase()}`}
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-blue-900/75" />
        </div>

        <div className="relative container mx-auto px-4 py-28">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para serviços
          </Link>

          <div className="mt-10 max-w-3xl text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{category.title}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{service.name}</h1>
            <p className="mt-4 text-lg text-white/85">{detail.heroSubtitle}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button className="h-12 rounded-full bg-white px-6 text-base font-semibold text-[#1e3a8a] hover:bg-white/90" asChild>
                <Link href="/proposta-de-terceirizacao">Solicitar uma proposta</Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-white/10 px-6 text-base font-semibold text-white hover:bg-white/20"
                asChild
              >
                <Link href="/contato">
                  <Mail className="mr-2 h-4 w-4" />
                  Falar com um especialista
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
            <article className="space-y-8">
              {detail.description.map((paragraph) => (
                <p key={paragraph.slice(0, 20)} className="text-lg leading-relaxed text-gray-700">
                  {paragraph}
                </p>
              ))}

              <div>
                <h2 className="text-2xl font-semibold text-[#1e3a8a]">O que entregamos nesse serviço</h2>
                <ul className="mt-4 space-y-3">
                  {detail.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 className="mt-1 h-5 w-5 text-[#2563eb]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 shadow-sm">
              <div>
                <h3 className="text-xl font-semibold text-[#1e3a8a]">Diferenciais JSP</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Equipes alinhadas à cultura da sua empresa, com supervisão próxima e indicadores claros.
                </p>
                <ul className="mt-6 space-y-4">
                  {detail.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#e5edff] text-[#1e3a8a]">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 rounded-2xl bg-white p-6 shadow-inner">
                <h4 className="text-sm font-semibold text-[#1e3a8a]">Precisa de um escopo personalizado?</h4>
                <p className="mt-2 text-sm text-gray-600">
                  Criamos operações sob medida para diferentes setores. Fale conosco para construir uma solução exclusiva.
                </p>
                <Button asChild className="mt-4 h-10 rounded-full bg-[#2563eb] text-white hover:bg-[#1e40af]">
                  <Link href="/contato">Agendar conversa</Link>
                </Button>
              </div>
            </aside>
          </div>

          {detail.gallery && detail.gallery.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-semibold text-[#1e3a8a]">Momentos em ação</h3>
              <p className="mt-2 text-sm text-gray-600">
                Registros de operações reais que demonstram nosso padrão de qualidade.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detail.gallery.map((image) => (
                  <div key={image} className="relative overflow-hidden rounded-3xl">
                    <img
                      src={image}
                      alt={`Equipe JSP executando ${service.name.toLowerCase()}`}
                      className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedServices.length > 0 && (
            <div className="mt-16 border-t border-slate-200 pt-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#2563eb]">
                    {category.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">Outros serviços da categoria</h3>
                  <p className="text-sm text-gray-600">
                    Explore soluções complementares que podem somar ao seu contrato.
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/servicos#${category.id}`}>Ver todos os serviços</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedServices.map((item) => (
                  <Card key={item.slug} className="flex flex-col gap-4 p-6">
                    <div>
                      <p className="text-sm font-semibold text-[#2563eb]">{category.subtitle}</p>
                      <h4 className="mt-1 text-xl font-semibold text-gray-900">{item.name}</h4>
                    </div>
                    <Button asChild variant="ghost" className="mt-auto justify-start gap-2 text-[#1e3a8a] hover:bg-[#e5edff]">
                      <Link href={`/servicos/${category.id}/${item.slug}`}>
                        Ver detalhes
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#1d4ed8] py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center text-white">
            <h2 className="text-3xl font-bold md:text-4xl">Pronto para levar este serviço para a sua empresa?</h2>
            <p className="text-base text-white/85 md:max-w-3xl">
              Conte com a JSP para implantar uma operação eficiente, com indicadores, supervisão dedicada e equipes
              comprometidas em encantar o seu público.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button className="h-12 rounded-full bg-white px-8 text-[#1e3a8a] hover:bg-white/90">
                Solicitar proposta detalhada
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-white bg-transparent px-8 text-white hover:bg-white/10"
                asChild
              >
                <Link href="https://wa.me/5581999999999" target="_blank" rel="noopener noreferrer">
                  Falar via WhatsApp
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

