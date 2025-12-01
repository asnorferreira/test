import { Button } from "@/packages/web/components/ui/button"
import { Upload } from "lucide-react"

export function Careers() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-[#1e3a8a] mb-4 tracking-wider">CARREIRAS</p>
            <h2 className="text-3xl font-bold text-[#2563eb] mb-6">
              Capacitamos você a buscar o que realmente importa.
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Acreditamos que uma carreira em gestão de facilities e serviços deve nos capacitar a nos tornarmos os
              melhores que podemos ser e fornecer uma equipe de apoio que nos ajuda ao longo do caminho.
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">
              Então, não importa o que você está buscando — um novo desafio, um senso de pertencimento, ou apenas um
              emprego melhor — nosso foco é ajudá-lo a alcançar seu potencial completo.
            </p>
            <Button size="lg" className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-8">
              <Upload className="w-4 h-4 mr-2" />
              ENVIAR CURRÍCULO
            </Button>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80"
              alt="Profissionais colaborando em escritório moderno"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
