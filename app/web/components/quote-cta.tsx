export function QuoteCTA() {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center py-24"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1454166155302-ef4863c27e70?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/80 via-[#1e3a8a]/70 to-[#1d4ed8]/60" />
      <div className="container relative mx-auto flex justify-center px-4">
        <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/15 p-8 text-center shadow-2xl backdrop-blur-lg md:p-10">
          <h2 className="text-4xl font-bold text-white md:text-5xl">Estamos Contratando</h2>
          <p className="mt-5 text-lg leading-relaxed text-white/90">
            Você merece uma carreira onde pode conquistar o que realmente importa para você. Não importa o que você está
            procurando - um novo desafio, senso de pertencimento, ou um trabalho melhor - a JSP é uma empresa que atua em diversos segmentos.
            Faça parte da nossa equipe e venha crescer junto com a gente!
          </p>
          <button className="mt-8 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/20 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/30 hover:shadow-lg">
            Enviar Curriculo
          </button>
        </div>
      </div>
    </section>
  )
}
