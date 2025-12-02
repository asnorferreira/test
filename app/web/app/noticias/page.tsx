import { News } from "@/app/web/components/news"

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Transparência</p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">Transparência e Igualdade Salarial</h1>
          <p className="mt-4 text-lg text-white/80 max-w-3xl mx-auto">
            Apresentamos os Relatórios de Transparência e Igualdade Salarial entre Mulheres e Homens, referentes ao
            1º e 2º semestres de 2025.
          </p>
        </div>
      </section>

      <section id="news-section">
        <News />
      </section>
    </main>
  )
}
