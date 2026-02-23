export type OrderStatus = 'pendente' | 'pago' | 'enviado' | 'cancelado'
export type PrescriptionStatus = 'pendente' | 'emitida' | 'cancelada'

export type AdminOrder = {
  id: string
  createdAt: number
  status: OrderStatus
  customerName: string
  totalCents: number
  items: Array<{ name: string; quantity: number; priceCents: number }>
}

export type AdminPrescription = {
  id: string
  createdAt: number
  status: PrescriptionStatus
  patientName: string
  caseId: string
  notes?: string
}

export type ProductConfig = {
  id: 'mvp-001'
  name: string
  description: string
  active: boolean
  priceCents: number
}

const ORDERS_KEY = 'maemais_admin_orders_v1'
const PRESCRIPTIONS_KEY = 'maemais_admin_prescriptions_v1'
const PRODUCT_KEY = 'maemais_admin_product_v1'

const seedOrders: AdminOrder[] = [
  {
    id: 'o-9001',
    createdAt: Date.now() - 1000 * 60 * 25,
    status: 'pendente',
    customerName: 'Maria Silva',
    totalCents: 18990,
    items: [{ name: 'Fórmula MãeMais (MVP)', quantity: 1, priceCents: 18990 }],
  },
  {
    id: 'o-9002',
    createdAt: Date.now() - 1000 * 60 * 60 * 9,
    status: 'pago',
    customerName: 'Juliana Rocha',
    totalCents: 18990,
    items: [{ name: 'Fórmula MãeMais (MVP)', quantity: 1, priceCents: 18990 }],
  },
  {
    id: 'o-9003',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    status: 'enviado',
    customerName: 'Carolina Alves',
    totalCents: 18990,
    items: [{ name: 'Fórmula MãeMais (MVP)', quantity: 1, priceCents: 18990 }],
  },
]

const seedPrescriptions: AdminPrescription[] = [
  {
    id: 'r-5001',
    createdAt: Date.now() - 1000 * 60 * 50,
    status: 'pendente',
    patientName: 'Maria Silva',
    caseId: 'c-1001',
    notes: 'Avaliar possível fissura e orientar rotina.',
  },
  {
    id: 'r-5002',
    createdAt: Date.now() - 1000 * 60 * 60 * 7,
    status: 'emitida',
    patientName: 'Bianca Souza',
    caseId: 'c-1004',
  },
]

const seedProduct: ProductConfig = {
  id: 'mvp-001',
  name: 'Fórmula MãeMais (MVP)',
  description: 'Produto único (MVP) — configuração inicial para testes do fluxo.',
  active: true,
  priceCents: 18990,
}

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
  if (!window.localStorage.getItem(ORDERS_KEY)) persist(ORDERS_KEY, seedOrders)
  if (!window.localStorage.getItem(PRESCRIPTIONS_KEY)) persist(PRESCRIPTIONS_KEY, seedPrescriptions)
  if (!window.localStorage.getItem(PRODUCT_KEY)) persist(PRODUCT_KEY, seedProduct)
}

export function listOrders(): AdminOrder[] {
  if (typeof window === 'undefined') return seedOrders
  ensureSeed()
  return safeParse(window.localStorage.getItem(ORDERS_KEY), seedOrders)
}

export function listPrescriptions(): AdminPrescription[] {
  if (typeof window === 'undefined') return seedPrescriptions
  ensureSeed()
  return safeParse(window.localStorage.getItem(PRESCRIPTIONS_KEY), seedPrescriptions)
}

export function getProduct(): ProductConfig {
  if (typeof window === 'undefined') return seedProduct
  ensureSeed()
  return safeParse(window.localStorage.getItem(PRODUCT_KEY), seedProduct)
}

export function setProduct(next: ProductConfig) {
  if (typeof window === 'undefined') return
  ensureSeed()
  persist(PRODUCT_KEY, next)
}

export function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

