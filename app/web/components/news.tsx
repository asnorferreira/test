export function News() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#1e3a8a]">Ações & Transparência</p>
          <h2 className="mt-3 text-4xl font-bold text-gray-900">Transparência e Igualdade Salarial</h2>
          <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
            Apresentamos os Relatórios de Transparência e Igualdade Salarial entre Mulheres e Homens, referentes
            ao 1º e 2º semestres de 2025.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-[32px] border border-slate-200 bg-slate-900 p-10 text-white shadow-lg">
            <p className="text-lg leading-relaxed tracking-wide">
              A publicação destes relatórios reflete nossa responsabilidade em manter relações de trabalho pautadas pela
              confiança, pela promoção da igualdade de gênero, pelo alinhamento às exigências legais e pelo fortalecimento
              da responsabilidade social.
            </p>
            <div className="mt-8 space-y-3 text-sm text-white/80">
              <p>• Indicadores transparentes sobre salário, benefícios e progresso técnico.</p>
              <p>• Compromisso com métricas que reforçam equidade e diversidade em campo.</p>
              <p>• Procedimentos auditados por equipes internas e parceiros independentes.</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Nosso compromisso</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Seguiremos trabalhando ativamente para promover um ambiente de trabalho inclusivo e equitativo para todos
              os nossos colaboradores, pois acreditamos que a valorização das pessoas é o que sustenta o crescimento do
              Mundo de Pessoas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
