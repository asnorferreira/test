import { apiRequest } from '@/lib/api-client'

export type ShippingOption = {
  id: string
  carrier: string
  service: string
  priceCents: number
  estimatedDays: number
}

export type ShippingQuote = {
  zipCode: string
  address: {
    street: string
    neighborhood: string
    city: string
    state: string
  }
  options: ShippingOption[]
}

export async function quoteShipping(zipCode: string): Promise<ShippingQuote> {
  return apiRequest<ShippingQuote>('/shipping/quote', {
    method: 'POST',
    body: { zipCode },
  })
}
