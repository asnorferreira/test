import { Button } from "@/app/web/components/ui/button"
import { Input } from "@/app/web/components/ui/input"
import { Textarea } from "@/app/web/components/ui/textarea"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-white pt-32">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-5xl font-bold mb-6">Entre em Contato</h1>
              <p className="text-xl leading-relaxed">
                Estamos prontos para atender você. Entre em contato conosco e descubra como podemos ajudar sua empresa.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Envie sua Mensagem</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <Input placeholder="Seu nome completo" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                      <Input placeholder="Nome da empresa" className="w-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                      <Input type="email" placeholder="seu@email.com" className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <Input placeholder="(00) 00000-0000" className="w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                    <Input placeholder="Como podemos ajudar?" className="w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                    <Textarea placeholder="Descreva sua necessidade..." rows={6} className="w-full" />
                  </div>

                  <Button className="w-full bg-[#1e3a8a] hover:bg-[#2563eb] text-white py-6 text-lg">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    Nossa equipe está pronta para atender você. Entre em contato através de qualquer um dos canais
                    abaixo.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Endereço</h3>
                      <p className="text-gray-600">
                        Rua Engenheiro José Brandão
                        Cavalcante, 419 - Imbiribeira
                        <br />
                        Recife, PE - CEP 50000-000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                      <p className="text-gray-600">
                        (81) 3244-8767
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
                      <p className="text-gray-600">
                        contratos@jspservicos.com.br
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horário de Atendimento</h3>
                      <p className="text-gray-600">
                        Segunda a Sexta: 8h às 17h
                        <br />
                        Sábado: 8h às 12h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg h-64 bg-gray-200">
                  <iframe
                    title="Localização da JSP"
                    src="https://maps.google.com/maps?q=Rua%20Engenheiro%20Jos%C3%A9%20Brand%C3%A3o%20Cavalcante%2C%20419%20-%20Imbiribeira%2C%20Recife%20-%20PE&z=15&output=embed"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
  )
}
