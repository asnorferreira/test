export type UserRole = 'patient' | 'doctor' | 'admin'

export type Session = {
  id: string
  role: UserRole
  email: string
  name: string
  createdAt: number
}

const SESSION_KEY = 'maemais_session_v1'

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function setSession(session: Session) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SESSION_KEY)
}

type DoctorCredentials = {
  email: string
  password: string
}

export const MOCK_DOCTOR_CREDENTIALS: DoctorCredentials = {
  email: 'medico@maemais.com',
  password: '123456',
}

export function signInDoctor(credentials: DoctorCredentials): { ok: boolean; error?: string } {
  const email = credentials.email.trim().toLowerCase()
  const password = credentials.password

  if (email !== MOCK_DOCTOR_CREDENTIALS.email || password !== MOCK_DOCTOR_CREDENTIALS.password) {
    return { ok: false, error: 'Credenciais inválidas.' }
  }

  setSession({
    id: 'd-001',
    role: 'doctor',
    email,
    name: 'Dra. Ana (mock)',
    createdAt: Date.now(),
  })

  return { ok: true }
}

export function isDoctor(session: Session | null) {
  return session?.role === 'doctor'
}

export function isAdmin(session: Session | null) {
  return session?.role === 'admin'
}

type PatientCredentials = {
  email: string
  password: string
}

export const MOCK_ADMIN_CREDENTIALS: PatientCredentials = {
  email: 'admin@maemais.com',
  password: '123456',
}

export function signInPatient(credentials: PatientCredentials): { ok: boolean; error?: string } {
  const email = credentials.email.trim().toLowerCase()
  const password = credentials.password

  if (!email || !password) return { ok: false, error: 'Preencha e-mail e senha.' }

  if (email === MOCK_ADMIN_CREDENTIALS.email && password === MOCK_ADMIN_CREDENTIALS.password) {
    setSession({
      id: 'a-001',
      role: 'admin',
      email,
      name: 'Admin (mock)',
      createdAt: Date.now(),
    })
    return { ok: true }
  }

  setSession({
    id: 'p-001',
    role: 'patient',
    email,
    name: 'Maria (mock)',
    createdAt: Date.now(),
  })

  return { ok: true }
}

export function isPatient(session: Session | null) {
  return session?.role === 'patient'
}
