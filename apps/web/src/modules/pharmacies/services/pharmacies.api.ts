import { apiRequest } from '@/lib/api-client'

export type PartnerPharmacy = {
  id: string
  name: string
  cnpj: string
  city: string
  state: string
  distanceKm: number
  estimatedDeliveryDays: number
  rating: number
}

export async function listPharmacies(zipCode?: string): Promise<PartnerPharmacy[]> {
  return apiRequest<PartnerPharmacy[]>('/pharmacies', { query: { zipCode } })
}
