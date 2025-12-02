import Link from "next/link"
import { Button } from "@/app/web/components/ui/button"
import { ServiceCategory } from "@/app/web/components/service-category"
import { serviceCategories } from "@/app/web/lib/services-data"

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#2563eb] py-28">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Nossos Serviços</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              Oferecemos soluções em terceirização de mão de obra com profissionais qualificados e capacitados.
            </h1>
            <Button className="mt-8 rounded-full bg-white px-8 py-3 text-base font-semibold text-[#1e3a8a] hover:bg-white/90">
              <Link href="/proposta-terceirizacao" >
                Solicite um Orçamento
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {serviceCategories.map((category) => (
          <ServiceCategory key={category.id} {...category} />
        ))}
      </div>
    </main>
  )
}
