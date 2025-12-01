"use client"

import { ChevronRight, Sparkles, Building2, Wrench, Shield } from "lucide-react"
import { Button } from "@/packages/web/components/ui/button"
import { Card } from "@/packages/web/components/ui/card"
import { cardStyles } from "@/packages/web/lib/card-styles"

const services = [
  {
    icon: Sparkles,
    title: "Administrativo",
    description:
      "Profissionais qualificados para recepção, portaria, auxiliar administrativo, digitador, motofrentista muito mais.",
    image: "/professional-office-receptionist.jpg",
  },
  {
    icon: Building2,
    title: "Limpeza e Conservação",
    description: "Serviços de limpeza, conservação, jardinagem, pintura e manutenção predial com equipe especializada.",
    image: "/modern-building-glass-facade.jpg",
  },
  {
    icon: Wrench,
    title: "Serviços Gerais",
    description:
      "Auxiliar de serviços gerais, copeira, maqueiro, ascensorista, lavador de veículos e supervisor operacional.",
    image: "/maintenance-worker-in-uniform.jpg",
  },
  {
    icon: Shield,
    title: "Arquitetura e Engenharia",
    description: "Arquiteto, engenheiro(civil, mecânico, eletricista, ambiental, florestal), técnico de edificação.",
    image: "/healthcare-professional.png",
  },
]

export function Services() {
  return (
    <section className="relative bg-gradient-to-b from-white via-white to-[#f1f5f9] py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#1e3a8a]">Nossos Serviços</p>
              <h2 className="text-3xl font-bold leading-tight text-blue-900 md:text-4xl">
                Oferecemos soluções completas para empresas que buscam excelência.
              </h2>
            </div>
            <Button
              variant="outline"
              className="h-12 rounded-full border-2 border-[#1e3a8a] px-6 text-sm font-semibold tracking-wide text-[#1e3a8a] transition-colors hover:bg-[#1e3a8a] hover:text-white"
            >
              VER TODOS OS SERVIÇOS
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.title} className={cardStyles.container}>
                  <div className={cardStyles.imageWrapper}>
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      className={cardStyles.image}
                    />
                  </div>
                  <div className={`${cardStyles.body} gap-4`}>
                    <div className={`${cardStyles.iconWrapper} bg-[#1e3a8a] text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    <Button variant="link" className={`${cardStyles.link} mt-auto`}>
                      SAIBA MAIS →
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          <button className="absolute -right-6 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-2xl ring-4 ring-white transition-colors hover:bg-[#1e40af]">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
