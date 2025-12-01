"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight, InstagramIcon } from "lucide-react"
import { Button } from "@/packages/web/components/ui/button"

const instagramUrl = "https://www.instagram.com/jsp_servicos/"

const posts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
    slides: "3/6",
    caption: "Bastidores das nossas operações em um grande cliente.",
    timeAgo: "3 dias atrás",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    slides: "4/6",
    caption: "Tecnologia e gestão garantindo excelência em cada entrega.",
    timeAgo: "1 semana atrás",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=600&q=80",
    slides: "5/6",
    caption: "Capacitação contínua da equipe JSP Serviços.",
    timeAgo: "2 semanas atrás",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80",
    slides: "6/6",
    caption: "Conectando pessoas e espaços com qualidade.",
    timeAgo: "3 semanas atrás",
  },
]

export function Instagram() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 4 >= posts.length ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, posts.length - 4) : prev - 1))
  }

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
              <InstagramIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a]/70">@jsp_servicos</p>
              <h2 className="text-3xl font-bold text-[#1e3a8a]">Últimas Postagens do Instagram</h2>
            </div>
          </div>

          <Button
            asChild
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-8 text-white hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
          >
            <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
              Seguir no Instagram
            </Link>
          </Button>
        </div>

        <div className="relative">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
              aria-label="Post anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
              aria-label="Próximo post"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {posts.slice(currentIndex, currentIndex + 4).map((post) => (
              <Link
                key={post.id}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl"
              >
                <div className="relative flex-1 overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={`Post ${post.id} do Instagram JSP Serviços`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white">
                    {post.slides}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="flex items-center gap-3 bg-white p-4 text-sm font-medium text-gray-700">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                    <InstagramIcon className="h-5 w-5 text-[#1e3a8a]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#1e3a8a]">@jsp_servicos</span>
                    <span className="text-xs font-normal text-gray-500">{post.timeAgo}</span>
                  </div>
                </div>
                <div className="bg-white px-4 pb-4 text-sm text-gray-600">
                  {post.caption}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="h-2 w-2 rounded-full bg-[#2563eb]" />
            Estamos sempre ativos no Instagram
          </div>
        </div>
      </div>
    </section>
  )
}
