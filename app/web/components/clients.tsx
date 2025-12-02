"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import { Button } from "@/app/web/components/ui/button"
import { Card } from "@/app/web/components/ui/card"
import { cardStyles } from "@/app/web/lib/card-styles"

const clients = [
  {
    name: "Prefeitura do Recife",
    description:
      "Parceria estratégica com a Prefeitura do Recife, fornecendo serviços de qualidade para diversos setores municipais.",
    image: "/recife-city-skyline-sunset.jpg",
  },
  {
    name: "Governo de Pernambuco",
    description:
      "Colaboração com o Estado de Pernambuco através do programa Recife Bom de Buco, promovendo desenvolvimento social.",
    image: "/government-building-architecture.jpg",
  },
  {
    name: "Prefeitura Paulista",
    description:
      "Serviços integrados para a Prefeitura Municipal Paulista, contribuindo para a excelência na gestão pública.",
    image: "/modern-city-hall-building.jpg",
  },
  {
    name: "Shopping Guararapes",
    description: "Parceria no setor Shopping Guararapes, oferecendo serviços especializados.",
    image: "/modern-mall-interior.png",
  },
]

export function Clients() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 3 >= clients.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, clients.length - 3) : prev - 1))
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-[#1e3a8a] mb-2">NOSSOS CLIENTES</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Se você atende pessoas, nós atendemos você.</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Criamos experiências que importam onde quer que as pessoas trabalhem, aprendam, se recuperem e se divirtam.
          </p>
        </div>

        <div className="relative mb-8">
          <div className="flex items-center justify-end gap-4 mb-8">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.slice(currentIndex, currentIndex + 3).map((client) => (
              <Card key={client.name} className={cardStyles.container}>
                <div className={cardStyles.imageWrapper}>
                  <img
                    src={client.image || "/placeholder.svg"}
                    alt={client.name}
                    className={cardStyles.image}
                  />
                </div>
                <div className={`${cardStyles.body} gap-4`}>
                  <div className={`${cardStyles.iconWrapper} bg-[#1e3a8a] text-white`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{client.description}</p>
                  <Button variant="link" className={`${cardStyles.link} mt-auto`}>
                    SAIBA MAIS →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
