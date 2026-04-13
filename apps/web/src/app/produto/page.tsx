'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MainContainer } from '@/modules/components/layout/MainContainer'
import { Card, CardTitle } from '@/modules/components/ui/Card'
import { Button } from '@/modules/components/ui/Button'
import { Alert } from '@/modules/components/ui/Alert'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useCart, formatBRL } from '@/modules/cart/CartContext'
import { listProducts, productPriceToCents, type Product } from '@/modules/products/services/products.api'
import { listMyActivePrescriptions, type PatientPrescription } from '@/modules/prescriptions/services/prescriptions.api'
import { ROUTES } from '@/lib/routing/routes'

export default function ProdutoPage() {
  const { session, loading: authLoading } = useAuth()
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const productsData = await listProducts(true)
        if (cancelled) return
        setProducts(productsData)

        if (session) {
          try {
            const presc = await listMyActivePrescriptions()
            if (!cancelled) setPrescriptions(presc)
          } catch {
            // Silencioso: usuário pode não ser PATIENT ou ainda não ter prescrição.
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Falha ao carregar produtos.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session])

  const hasActivePrescription = prescriptions.length > 0
  const canPurchase = !!session && hasActivePrescription

  function handleAdd(product: Product) {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitPriceCents: productPriceToCents(product.basePrice),
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <MainContainer>
      <h1 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 32, margin: '0 0 8px' }}>
        Produtos recomendados
      </h1>
      <p style={{ color: '#6b6876', marginTop: 0, marginBottom: 24 }}>
        Escolha entre os itens liberados pela sua consulta médica.
      </p>

      {!authLoading && !session && (
        <div style={{ marginBottom: 20 }}>
          <Alert variant="info">
            Para adicionar produtos ao carrinho, você precisa{' '}
            <Link href={ROUTES.entrar} style={{ color: '#1f3a80', fontWeight: 600 }}>
              entrar na sua conta
            </Link>
            .
          </Alert>
        </div>
      )}

      {session && !hasActivePrescription && (
        <div style={{ marginBottom: 20 }}>
          <Alert variant="warning">
            Você ainda não possui uma prescrição ativa. Complete uma consulta com o médico para
            liberar os produtos.
            <div style={{ marginTop: 8 }}>
              <Link href={ROUTES.questionario} style={{ color: '#8a5a00', fontWeight: 600 }}>
                Ir para o questionário médico →
              </Link>
            </div>
          </Alert>
        </div>
      )}

      {loading && <p>Carregando produtos…</p>}
      {error && <Alert variant="error">{error}</Alert>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
          marginTop: 20,
        }}
      >
        {products.map((p) => (
          <Card key={p.id}>
            <CardTitle>{p.name}</CardTitle>
            {p.description && (
              <p style={{ color: '#6b6876', fontSize: 14, minHeight: 48 }}>{p.description}</p>
            )}
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#d14b72',
                marginTop: 12,
                marginBottom: 16,
              }}
            >
              {formatBRL(productPriceToCents(p.basePrice))}
            </div>
            <Button
              fullWidth
              disabled={!canPurchase}
              onClick={() => handleAdd(p)}
            >
              {!session
                ? 'Entre para comprar'
                : !hasActivePrescription
                  ? 'Aguarda prescrição'
                  : addedId === p.id
                    ? '✓ Adicionado'
                    : 'Adicionar ao carrinho'}
            </Button>
          </Card>
        ))}
      </div>
    </MainContainer>
  )
}
