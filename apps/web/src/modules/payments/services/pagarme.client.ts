// Tokenização de cartão diretamente no navegador via API pública do Pagar.me v5.
// Evita que dados de cartão toquem nosso backend (reduz escopo PCI).
// Usa a PUBLIC KEY exposta em NEXT_PUBLIC_PAGARME_PUBLIC_KEY.

const PAGARME_API_URL =
  process.env.NEXT_PUBLIC_PAGARME_API_URL ?? 'https://api.pagar.me/core/v5'

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY

export type CardInput = {
  number: string
  holderName: string
  expMonth: number
  expYear: number
  cvv: string
}

export type CardTokenResponse = {
  id: string
  type: string
  created_at: string
  expires_at: string
  card: {
    last_four_digits: string
    holder_name: string
    brand: string
  }
}

export async function tokenizeCard(input: CardInput): Promise<CardTokenResponse> {
  if (!PUBLIC_KEY) {
    throw new Error(
      'NEXT_PUBLIC_PAGARME_PUBLIC_KEY não configurada. Adicione no .env.local do web.',
    )
  }

  const res = await fetch(
    `${PAGARME_API_URL}/tokens?appId=${encodeURIComponent(PUBLIC_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'card',
        card: {
          number: input.number.replace(/\s/g, ''),
          holder_name: input.holderName,
          exp_month: input.expMonth,
          exp_year: input.expYear,
          cvv: input.cvv,
        },
      }),
    },
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message =
      data?.message || data?.errors?.[0]?.message || 'Falha ao tokenizar cartão'
    throw new Error(message)
  }

  return (await res.json()) as CardTokenResponse
}
