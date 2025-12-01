import { Hero } from "@/packages/web/components/hero"
import { Services } from "@/packages/web/components/services"
import { WhyHireUs } from "@/packages/web/components/why-hire-us"
import { QuoteCTA } from "@/packages/web/components/quote-cta"
import { Clients } from "@/packages/web/components/clients"
import { Instagram } from "@/packages/web/components/instagram"
import { News } from "@/packages/web/components/news"

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
