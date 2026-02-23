export type CaseStatus = 'pendente' | 'em_pre_analise' | 'aprovado' | 'recusado'

export type DoctorCase = {
  id: string
  patient: {
    id: string
    name: string
  }
  createdAt: number
  updatedAt: number
  status: CaseStatus
  questionnaire: Array<{ question: string; answer: string }>
  preAnalysisAlerts: string[]
}

export type PatientNotification = {
  id: string
  patientId: string
  caseId: string
  message: string
  createdAt: number
  read: boolean
}

const CASES_KEY = 'maemais_cases_v1'
const NOTIFICATIONS_KEY = 'maemais_patient_notifications_v1'

const seedCases: DoctorCase[] = [
  {
    id: 'c-1001',
    patient: { id: 'p-001', name: 'Maria Silva' },
    createdAt: Date.now() - 1000 * 60 * 55,
    updatedAt: Date.now() - 1000 * 60 * 55,
    status: 'pendente',
    preAnalysisAlerts: ['Possível fissura mamilar', 'Relato de dor intensa ao amamentar'],
    questionnaire: [
      { question: 'Idade', answer: '29' },
      { question: 'Tempo de pós-parto', answer: '12 dias' },
      { question: 'Sintomas principais', answer: 'Dor ao amamentar e baixa produção' },
      { question: 'Uso de medicação', answer: 'Não' },
      { question: 'Bebê mamando', answer: 'A cada 2-3 horas' },
    ],
  },
  {
    id: 'c-1002',
    patient: { id: 'p-002', name: 'Juliana Rocha' },
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    status: 'em_pre_analise',
    preAnalysisAlerts: ['Histórico de mastite', 'Febre relatada nas últimas 24h'],
    questionnaire: [
      { question: 'Idade', answer: '33' },
      { question: 'Tempo de pós-parto', answer: '2 meses' },
      { question: 'Sintomas principais', answer: 'Sensibilidade e febre' },
      { question: 'Dor localizada', answer: 'Sim, mama direita' },
      { question: 'Amamentação exclusiva', answer: 'Sim' },
    ],
  },
  {
    id: 'c-1003',
    patient: { id: 'p-003', name: 'Carolina Alves' },
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
    updatedAt: Date.now() - 1000 * 60 * 60 * 22,
    status: 'pendente',
    preAnalysisAlerts: ['Sono muito fragmentado', 'Ansiedade relatada'],
    questionnaire: [
      { question: 'Idade', answer: '27' },
      { question: 'Tempo de pós-parto', answer: '5 semanas' },
      { question: 'Sintomas principais', answer: 'Cansaço e ansiedade' },
      { question: 'Rede de apoio', answer: 'Baixa' },
      { question: 'Alimentação', answer: 'Irregular' },
    ],
  },
  {
    id: 'c-1004',
    patient: { id: 'p-004', name: 'Bianca Souza' },
    createdAt: Date.now() - 1000 * 60 * 60 * 40,
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
    status: 'aprovado',
    preAnalysisAlerts: [],
    questionnaire: [
      { question: 'Idade', answer: '31' },
      { question: 'Tempo de pós-parto', answer: '3 meses' },
      { question: 'Sintomas principais', answer: 'Queda de produção' },
      { question: 'Sono', answer: '6h/dia (interrompido)' },
    ],
  },
]

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function persist<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function ensureSeed() {
  if (typeof window === 'undefined') return
  const existing = window.localStorage.getItem(CASES_KEY)
  if (!existing) persist(CASES_KEY, seedCases)
  const existingNotifications = window.localStorage.getItem(NOTIFICATIONS_KEY)
  if (!existingNotifications) persist(NOTIFICATIONS_KEY, [])
}

export function listCases(): DoctorCase[] {
  if (typeof window === 'undefined') return seedCases
  ensureSeed()
  return safeParse(window.localStorage.getItem(CASES_KEY), seedCases)
}

export function getCaseById(caseId: string): DoctorCase | null {
  const cases = listCases()
  return cases.find((item) => item.id === caseId) ?? null
}

export function setCaseStatus(caseId: string, status: CaseStatus) {
  if (typeof window === 'undefined') return
  ensureSeed()
  const cases = listCases()
  const index = cases.findIndex((item) => item.id === caseId)
  if (index < 0) return

  const current = cases[index]
  if (current.status === status) return

  const updated: DoctorCase = { ...current, status, updatedAt: Date.now() }
  const nextCases = [...cases.slice(0, index), updated, ...cases.slice(index + 1)]
  persist(CASES_KEY, nextCases)

  if (status === 'aprovado' || status === 'recusado') {
    const notifications = listPatientNotifications()
    const message =
      status === 'aprovado'
        ? `Seu caso ${caseId} foi aprovado. Você já pode seguir para a próxima etapa.`
        : `Seu caso ${caseId} foi recusado. Confira as orientações e reenviar se necessário.`
    const notification: PatientNotification = {
      id: `n-${Date.now()}`,
      patientId: updated.patient.id,
      caseId: updated.id,
      message,
      createdAt: Date.now(),
      read: false,
    }
    persist(NOTIFICATIONS_KEY, [notification, ...notifications])
  }
}

export function listPatientNotifications(patientId?: string): PatientNotification[] {
  if (typeof window === 'undefined') return []
  ensureSeed()
  const all = safeParse<PatientNotification[]>(window.localStorage.getItem(NOTIFICATIONS_KEY), [])
  return patientId ? all.filter((n) => n.patientId === patientId) : all
}

export function markNotificationRead(notificationId: string) {
  if (typeof window === 'undefined') return
  const notifications = listPatientNotifications()
  const next = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  persist(NOTIFICATIONS_KEY, next)
}

export function clearNotifications() {
  if (typeof window === 'undefined') return
  persist(NOTIFICATIONS_KEY, [])
}

