import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { WhyHireUs } from "@/components/why-hire-us"
import { QuoteCTA } from "@/components/quote-cta"
import { Clients } from "@/components/clients"
import { Careers } from "@/components/careers"
import { Instagram } from "@/components/instagram"

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <WhyHireUs />
      <QuoteCTA />
      <Clients />
      <Instagram />
      <Careers />
    </main>
  )
}
