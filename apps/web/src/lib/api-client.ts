// Cliente HTTP simples para a API NestJS.
// Lê base URL de NEXT_PUBLIC_API_URL (fallback: http://localhost:3333).
// Injeta Bearer token vindo do localStorage (chave maemais_token_v1).

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

const TOKEN_KEY = 'maemais_token_v1'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  data: any
  constructor(status: number, message: string, data?: any) {
    super(message)
    this.status = status
    this.data = data
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  body?: any
  auth?: boolean
  query?: Record<string, string | number | boolean | undefined>
}

export async function apiRequest<T = any>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true, query } = opts

  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    const message =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      `Erro ${res.status}`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

function safeParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const API_BASE_URL = API_URL
