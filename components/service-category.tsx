import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cardStyles } from "@/lib/card-styles"

interface Service {
  name: string
  slug: string
  shortDescription: string
  image: string
}

interface ServiceCategoryProps {
  id: string
  title: string
  subtitle: string
  description: string
  services: Service[]
}

export function ServiceCategory({ id, title, subtitle, description, services }: ServiceCategoryProps) {
  return (
    <section id={id} className="py-16 bg-white even:bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <p className="text-sm font-semibold text-gray-500 mb-2">{title}</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{subtitle}</h2>
          <p className="text-lg text-gray-700 max-w-3xl">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.name} className={cardStyles.container}>
              <div className={cardStyles.imageWrapper}>
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  className={cardStyles.image}
                />
              </div>
              <div className={`${cardStyles.body} gap-4`}>
                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                <p className="text-gray-600 leading-relaxed">{service.shortDescription}</p>
                <Button asChild variant="link" className={`${cardStyles.link} mt-auto`}>
                  <Link href={`/servicos/${id}/${service.slug}`}>SAIBA MAIS →</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
