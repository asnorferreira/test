'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainContainer } from '@/modules/components/layout/MainContainer'
import { AuthGuard } from '@/modules/components/layout/AuthGuard'
import { Card, CardTitle } from '@/modules/components/ui/Card'
import { Button } from '@/modules/components/ui/Button'
import { Input } from '@/modules/components/ui/Input'
import { Alert } from '@/modules/components/ui/Alert'
import { useCart, formatBRL } from '@/modules/cart/CartContext'
import { ShippingQuote } from '@/modules/shipping/services/shipping.api'
import {
  createOrder,
  payOrder,
  type ShippingAddressInput,
} from '@/modules/orders/services/orders.api'
import { tokenizeCard } from '@/modules/payments/services/pagarme.client'
import { listMyActivePrescriptions } from '@/modules/prescriptions/services/prescriptions.api'
import { ROUTES } from '@/lib/routing/routes'

type Draft = {
  quote: ShippingQuote
  selectedOptionId: string
  selectedPharmacyId: string | null
  subtotalCents: number
  shippingCents: number
  totalCents: number
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const { items, clear } = useCart()

  const [draft, setDraft] = useState<Draft | null>(null)
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null)
  const [noPrescription, setNoPrescription] = useState(false)

  // Endereço (pré-preenchido do ViaCEP)
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [recipient, setRecipient] = useState('')
  const [phone, setPhone] = useState('')

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'PIX'>('CREDIT_CARD')
  const [cpf, setCpf] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [installments, setInstallments] = useState(1)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    orderId: string
    transactionId?: string
    pix?: { qrCode: string; qrCodeUrl?: string }
  } | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('maemais_checkout_draft_v1')
    if (!raw) {
      router.replace(ROUTES.carrinho)
      return
    }
    try {
      const parsed: Draft = JSON.parse(raw)
      setDraft(parsed)
      setStreet(parsed.quote.address.street)
      setNeighborhood(parsed.quote.address.neighborhood)
      setCity(parsed.quote.address.city)
      setState(parsed.quote.address.state)
    } catch {
      router.replace(ROUTES.carrinho)
    }
  }, [router])

  useEffect(() => {
    listMyActivePrescriptions()
      .then((list) => {
        if (list.length === 0) {
          setNoPrescription(true)
        } else {
          setPrescriptionId(list[0].id)
        }
      })
      .catch(() => setNoPrescription(true))
  }, [])

  if (!draft) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft || !prescriptionId) return
    setError(null)
    setSubmitting(true)

    try {
      const shippingAddress: ShippingAddressInput = {
        zipCode: draft.quote.zipCode,
        street,
        number,
        complement: complement || undefined,
        neighborhood,
        city,
        state,
        recipient,
        phone,
      }

      const order = await createOrder({
        prescriptionId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress,
        shippingFeeCents: draft.shippingCents,
        partnerPharmacyId: draft.selectedPharmacyId ?? undefined,
      })

      let cardToken: string | undefined
      if (paymentMethod === 'CREDIT_CARD') {
        const [mmStr, yyStr] = cardExp.split('/').map((s) => s.trim())
        const expMonth = parseInt(mmStr, 10)
        const expYear = parseInt(yyStr?.length === 2 ? `20${yyStr}` : yyStr, 10)
        if (!expMonth || !expYear) {
          throw new Error('Validade do cartão inválida. Use MM/AA.')
        }
        const tokenRes = await tokenizeCard({
          number: cardNumber,
          holderName: cardHolder,
          expMonth,
          expYear,
          cvv: cardCvv,
        })
        cardToken = tokenRes.id
      }

      const paid = await payOrder(order.id, {
        paymentMethod,
        cardToken,
        installments: paymentMethod === 'CREDIT_CARD' ? installments : undefined,
        customerDocument: cpf.replace(/\D/g, ''),
      })

      clear()
      sessionStorage.removeItem('maemais_checkout_draft_v1')
      setSuccess({
        orderId: paid.id,
        transactionId: paid.transactionId,
        pix: paid.pix,
      })
    } catch (err: any) {
      setError(err.message ?? 'Não foi possível concluir o pagamento.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <MainContainer maxWidth={720}>
        <Card padding={32}>
          <CardTitle>Pedido confirmado! 🎉</CardTitle>
          <p>Obrigada pela sua compra. Seu pedido está sendo processado.</p>
          <p style={{ fontSize: 13, color: '#6b6876' }}>ID do pedido: {success.orderId}</p>
          {success.transactionId && (
            <p style={{ fontSize: 13, color: '#6b6876' }}>
              Transação: {success.transactionId}
            </p>
          )}
          {success.pix?.qrCode && (
            <div style={{ marginTop: 16 }}>
              <Alert variant="info">
                <strong>Escaneie o QR Code PIX para pagar:</strong>
                <pre
                  style={{
                    background: '#fff',
                    padding: 12,
                    marginTop: 8,
                    borderRadius: 8,
                    fontSize: 11,
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {success.pix.qrCode}
                </pre>
              </Alert>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <Button onClick={() => router.push(ROUTES.minhaContaPedidos)}>
              Ver meus pedidos
            </Button>
          </div>
        </Card>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 32, margin: '0 0 24px' }}>
        Checkout
      </h1>

      {noPrescription && (
        <div style={{ marginBottom: 20 }}>
          <Alert variant="error">
            Você não possui uma prescrição ativa. Complete a consulta médica antes de finalizar a
            compra.
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card padding={22}>
              <CardTitle>Endereço de entrega</CardTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <Input label="Rua" value={street} onChange={(e) => setStreet(e.target.value)} required />
                <Input label="Número" value={number} onChange={(e) => setNumber(e.target.value)} required />
              </div>
              <div style={{ marginTop: 12 }}>
                <Input
                  label="Complemento"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <Input
                  label="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                />
                <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                <Input label="UF" value={state} onChange={(e) => setState(e.target.value)} required maxLength={2} />
                <Input
                  label="CEP"
                  value={draft.quote.zipCode}
                  disabled
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <Input
                  label="Quem vai receber"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
                <Input
                  label="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>
            </Card>

            <Card padding={22}>
              <CardTitle>Pagamento</CardTitle>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <Button
                  type="button"
                  variant={paymentMethod === 'CREDIT_CARD' ? 'primary' : 'secondary'}
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                >
                  Cartão de crédito
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'PIX' ? 'primary' : 'secondary'}
                  onClick={() => setPaymentMethod('PIX')}
                >
                  PIX
                </Button>
              </div>

              <Input
                label="CPF do titular"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
                placeholder="000.000.000-00"
              />

              {paymentMethod === 'CREDIT_CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                  <Input
                    label="Número do cartão"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                  <Input
                    label="Nome impresso no cartão"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Input
                      label="Validade"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="MM/AA"
                      required
                    />
                    <Input
                      label="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      required
                      maxLength={4}
                    />
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4554' }}>
                        Parcelas
                      </span>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: '1px solid #f4c6d3',
                          fontSize: 15,
                          fontFamily: 'inherit',
                          background: '#fff',
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}x de {formatBRL(Math.round(draft.totalCents / n))}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === 'PIX' && (
                <div style={{ marginTop: 12 }}>
                  <Alert variant="info">
                    Ao confirmar, você receberá um QR Code PIX para efetuar o pagamento.
                  </Alert>
                </div>
              )}
            </Card>

            {error && <Alert variant="error">{error}</Alert>}
          </div>

          <div>
            <Card padding={22} style={{ position: 'sticky', top: 100 }}>
              <CardTitle>Resumo do pedido</CardTitle>
              {items.map((i) => (
                <div
                  key={i.productId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    padding: '4px 0',
                  }}
                >
                  <span>
                    {i.quantity}× {i.name}
                  </span>
                  <span>{formatBRL(i.unitPriceCents * i.quantity)}</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid #f6dde5', margin: '14px 0' }} />
              <Row label="Subtotal" value={formatBRL(draft.subtotalCents)} />
              <Row label="Frete" value={formatBRL(draft.shippingCents)} />
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
                <span style={{ color: '#d14b72' }}>{formatBRL(draft.totalCents)}</span>
              </div>
              <div style={{ marginTop: 18 }}>
                <Button
                  fullWidth
                  size="lg"
                  type="submit"
                  loading={submitting}
                  disabled={!prescriptionId || noPrescription}
                >
                  Finalizar pagamento
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
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
