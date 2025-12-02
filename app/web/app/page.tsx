import { Hero } from "@/app/web/components/hero"
import { Services } from "@/app/web/components/services"
import { WhyHireUs } from "@/app/web/components/why-hire-us"
import { QuoteCTA } from "@/app/web/components/quote-cta"
import { Clients } from "@/app/web/components/clients"
import { Instagram } from "@/app/web/components/instagram"
import { News } from "@/app/web/components/news"

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <WhyHireUs />
      <QuoteCTA />
      {/*<News /> */}
      <Clients />
      <Instagram />
    </main>
  )
}
