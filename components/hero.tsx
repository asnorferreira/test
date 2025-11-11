"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "Excelência em Serviços de Facilities Management",
    description:
      "Soluções completas em limpeza, manutenção e gestão predial para empresas que buscam eficiência operacional e redução de custos.",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 2,
    title: "Terceirização especializada para cada necessidade",
    description:
      "Equipes treinadas e qualificadas para recepção, portaria, serviços gerais, apoio administrativo e muito mais.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 3,
    title: "Tecnologia e gestão para resultados superiores",
    description:
      "Monitoramos indicadores em tempo real, garantindo qualidade, segurança e conformidade em todas as operações.",
    image: "https://images.unsplash.com/photo-1529429617124-aee711a30b7f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 4,
    title: "Parceiros estratégicos para o crescimento da sua empresa",
    description:
      "Construímos relações de longo prazo com transparência, previsibilidade e foco no sucesso do seu negócio.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = slides.length

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
    }, 8000)

    return () => clearInterval(timer)
  }, [totalSlides])

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  }

  return (
    <section className="relative h-screen">
      <div className="absolute inset-0">
        <img src={slides[currentSlide].image || "/placeholder.svg"} alt={slides[currentSlide].title} className="h-full w-full object-cover transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="container relative mx-auto flex h-full items-center px-4">
        <div className="max-w-2xl">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-1 w-12 bg-white" />
              <div className="h-1 w-12 bg-white/50" />
              <div className="h-1 w-12 bg-white/30" />
              <div className="h-1 w-12 bg-white/20" />
            </div>
            <div>
              <span className="text-6xl font-bold text-white/20">
                {String(currentSlide + 1).padStart(2, "0")}
              </span>
              <span className="ml-2 text-sm font-semibold text-white/40">/ {String(totalSlides).padStart(2, "0")}</span>
            </div>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl">{slides[currentSlide].title}</h1>

          <p className="mb-8 text-lg leading-relaxed text-white/90">{slides[currentSlide].description}</p>

          <div className="flex gap-4">
            <Button size="lg" className="px-8 text-white bg-[#2563eb] hover:bg-[#1e40af]">
              VER MAIS
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#1e3a8a]"
            >
              SAIBA MAIS
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-4 flex items-center gap-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Slide anterior"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 text-white transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próximo slide"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 text-white transition-colors hover:bg-white/10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "w-10 bg-white" : "w-6 bg-white/40 hover:bg-white/60"}`}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
