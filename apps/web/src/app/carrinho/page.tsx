'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MainContainer } from '@/modules/components/layout/MainContainer'
import { AuthGuard } from '@/modules/components/layout/AuthGuard'
import { Card, CardTitle } from '@/modules/components/ui/Card'
import { Button } from '@/modules/components/ui/Button'
import { Input } from '@/modules/components/ui/Input'
import { Alert } from '@/modules/components/ui/Alert'
import { useCart, formatBRL } from '@/modules/cart/CartContext'
import { quoteShipping, type ShippingOption, type ShippingQuote } from '@/modules/shipping/services/shipping.api'
import { listPharmacies, type PartnerPharmacy } from '@/modules/pharmacies/services/pharmacies.api'
import { ROUTES } from '@/lib/routing/routes'

export default function CarrinhoPage() {
  return (
    <AuthGuard>
      <CarrinhoContent />
    </AuthGuard>
  )
}

function CarrinhoContent() {
  const router = useRouter()
  const { items, subtotalCents, updateQuantity, removeItem } = useCart()

  const [zipCode, setZipCode] = useState('')
  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  const [pharmacies, setPharmacies] = useState<PartnerPharmacy[]>([])
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null)

  useEffect(() => {
    listPharmacies().then(setPharmacies).catch(() => setPharmacies([]))
  }, [])

  const selectedOption = useMemo<ShippingOption | null>(() => {
    if (!quote || !selectedOptionId) return null
    return quote.options.find((o) => o.id === selectedOptionId) ?? null
  }, [quote, selectedOptionId])

  const shippingCents = selectedOption?.priceCents ?? 0
  const totalCents = subtotalCents + shippingCents

  async function handleQuote(e: React.FormEvent) {
    e.preventDefault()
    setQuoteError(null)
    setQuote(null)
    setSelectedOptionId(null)
    setLoadingQuote(true)
    try {
      const result = await quoteShipping(zipCode)
      setQuote(result)
      if (result.options[0]) setSelectedOptionId(result.options[0].id)
      // Atualiza farmácias baseadas no CEP
      const pharm = await listPharmacies(zipCode)
      setPharmacies(pharm)
    } catch (err: any) {
      setQuoteError(err.message ?? 'Erro ao calcular frete.')
    } finally {
      setLoadingQuote(false)
    }
  }

  function goToCheckout() {
    if (!quote || !selectedOption) return
    sessionStorage.setItem(
      'maemais_checkout_draft_v1',
      JSON.stringify({
        quote,
        selectedOptionId,
        selectedPharmacyId,
        subtotalCents,
        shippingCents,
        totalCents,
      }),
    )
    router.push(ROUTES.checkout)
  }

  if (items.length === 0) {
    return (
      <MainContainer maxWidth={720}>
        <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 30 }}>
          Seu carrinho está vazio
        </h1>
        <p style={{ color: '#6b6876' }}>
          Explore nossos produtos liberados pela sua consulta médica.
        </p>
        <Link href={ROUTES.produto}>
          <Button>Ver produtos</Button>
        </Link>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 32, margin: '0 0 24px' }}>
        Meu carrinho
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((it) => (
            <Card key={it.productId} padding={20}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{it.name}</div>
                  <div style={{ fontSize: 13, color: '#8a8593' }}>
                    Preço unitário {formatBRL(it.unitPriceCents)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQuantity(it.productId, it.quantity - 1)}
                      disabled={it.quantity <= 1}
                    >
                      −
                    </Button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
                      {it.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#d14b72' }}>
                    {formatBRL(it.unitPriceCents * it.quantity)}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeItem(it.productId)}>
                    Remover
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          <Card padding={20}>
            <CardTitle>Frete</CardTitle>
            <form onSubmit={handleQuote} style={{ display: 'flex', gap: 10, alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="CEP de entrega"
                  placeholder="00000-000"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={9}
                />
              </div>
              <Button type="submit" loading={loadingQuote}>
                Calcular
              </Button>
            </form>

            {quoteError && (
              <div style={{ marginTop: 12 }}>
                <Alert variant="error">{quoteError}</Alert>
              </div>
            )}

            {quote && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: '#6b6876', marginBottom: 10 }}>
                  Entrega em {quote.address.city} - {quote.address.state}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {quote.options.map((opt) => {
                    const selected = selectedOptionId === opt.id
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          border: `1.5px solid ${selected ? '#d14b72' : '#f4c6d3'}`,
                          background: selected ? '#fef4f7' : '#fff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontFamily: 'inherit',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {opt.carrier} {opt.service}
                          </div>
                          <div style={{ fontSize: 12, color: '#8a8593' }}>
                            Entrega em até {opt.estimatedDays} dias úteis
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#d14b72' }}>
                          {formatBRL(opt.priceCents)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>

          {pharmacies.length > 0 && (
            <Card padding={20}>
              <CardTitle>Farmácias parceiras</CardTitle>
              <p style={{ fontSize: 13, color: '#6b6876', marginTop: 0, marginBottom: 12 }}>
                Escolha opcionalmente a farmácia de origem. (Mock — em breve integraremos os parceiros reais.)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pharmacies.map((ph) => {
                  const selected = selectedPharmacyId === ph.id
                  return (
                    <button
                      type="button"
                      key={ph.id}
                      onClick={() =>
                        setSelectedPharmacyId(selected ? null : ph.id)
                      }
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        border: `1.5px solid ${selected ? '#d14b72' : '#f0e1e6'}`,
                        background: selected ? '#fef4f7' : '#fff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{ph.name}</div>
                      <div style={{ fontSize: 12, color: '#8a8593', marginTop: 2 }}>
                        {ph.city}/{ph.state} · {ph.distanceKm.toFixed(1)} km · entrega em{' '}
                        {ph.estimatedDeliveryDays} dias · ⭐ {ph.rating.toFixed(1)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card padding={22} style={{ position: 'sticky', top: 100 }}>
            <CardTitle>Resumo</CardTitle>
            <Row label="Subtotal" value={formatBRL(subtotalCents)} />
            <Row
              label="Frete"
              value={selectedOption ? formatBRL(shippingCents) : '—'}
            />
            <hr style={{ border: 'none', borderTop: '1px solid #f6dde5', margin: '14px 0' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>Total</span>
              <span style={{ color: '#d14b72' }}>{formatBRL(totalCents)}</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <Button
                fullWidth
                size="lg"
                disabled={!selectedOption}
                onClick={goToCheckout}
              >
                Ir para o checkout
              </Button>
              {!selectedOption && (
                <p style={{ fontSize: 12, color: '#8a8593', marginTop: 8, textAlign: 'center' }}>
                  Calcule o frete para continuar.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </MainContainer>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: 14,
        color: '#4a4554',
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
