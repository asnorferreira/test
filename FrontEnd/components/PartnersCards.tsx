import Link from "next/link";

const partners = [
  {
    id: "bet365",
    logo: "/logos/bet365.svg",
    title: "Ganhe R$ 75 em Créditos de Aposta",
    desc:
      'Você deve clicar em “Participar” e apostar R$ 150 ou mais em partidas do Brasileirão Série A de 16/07/2025 e 17/07/2025, para receber R$ 75 em Créditos de Aposta. Se fizer apostas elegíveis totalizando entre R$ 50 e R$ 149,99, você receberá R$ 25 em Créditos de Aposta.',
    variant: "green",
  },
  {
    id: "novibet",
    logo: "/logos/novibet.svg",
    title: "R$ 50 em Aposta Extra!",
    desc:
      'Válido apenas para usuários ativos da Novibet, limitado a uma vez por usuário e uma vez por CPF/conta. Aposte um total de R$ 100 nas partidas de sua preferência, com odds mínimas de 2.0 ou superiores. Receba R$ 50 em Aposta Extra para continuar no jogo!',
    variant: "dark",
  },
];

export default function PartnersCards() {
  return (
    <section className="py-20 px-4 border-b border-[#1f2935]">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Bônus com Casas Parceiras</h2>
          <p className="text-white/70 text-lg">
            Ative vantagens exclusivas integradas aos nossos dashboards de probabilidades
          </p>
        </div>

        <div className="partners-cards">
          {partners.map((p) => (
            <article
              key={p.id}
              className={`partner-card partner-card--${p.variant}`}
              role="region"
              aria-labelledby={`${p.id}-title`}
            >
               {/* pequeno elemento decorativo no canto superior direito */}
              <span className="card-top-pill" aria-hidden="true" />
              <div className="card-inner">
                {/* logo (se não existir, mostrar iniciais via CSS fallback) */}
                <img src={p.logo} alt={p.id} className="card-logo" />

                <h3 id={`${p.id}-title`} className="card-title">
                  {p.title}
                </h3>

                <p className="card-desc">{p.desc}</p>

                <Link href="/signup" className="card-btn">
                  Ativar Bônus
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
