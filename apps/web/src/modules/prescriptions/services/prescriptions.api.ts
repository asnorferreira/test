import { apiRequest } from '@/lib/api-client'

export type PatientPrescription = {
  id: string
  medicalCaseId: string
  doctorId: string
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  documentUrl: string
  validUntil?: string | null
  createdAt: string
}

export async function listMyActivePrescriptions(): Promise<PatientPrescription[]> {
  return apiRequest<PatientPrescription[]>('/prescriptions/me')
}
