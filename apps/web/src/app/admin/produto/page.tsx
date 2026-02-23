'use client'

import { FormEvent, useEffect, useState } from 'react'
import styles from '../admin.module.css'
import { getProduct, setProduct, formatMoney, type ProductConfig } from '@/modules/admin/services/admin.store'

function parseMoneyToCents(input: string) {
  const normalized = input.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')
  const value = Number(normalized)
  if (Number.isNaN(value)) return null
  return Math.round(value * 100)
}

export default function AdminProdutoPage() {
  const [product, setProductState] = useState<ProductConfig | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setProductState(getProduct())
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setToast(null)
    if (!product) return

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const description = String(form.get('description') || '').trim()
    const priceRaw = String(form.get('price') || '').trim()
    const priceCents = parseMoneyToCents(priceRaw)

    if (!name) {
      setToast('Informe o nome do produto.')
      return
    }
    if (priceCents === null || priceCents < 0) {
      setToast('Informe um preço válido.')
      return
    }

    const next: ProductConfig = {
      ...product,
      name,
      description,
      active: product.active,
      priceCents,
    }

    setProduct(next)
    setProductState(next)
    setToast('Produto atualizado.')
  }

  if (!product) {
    return (
      <div className={styles.grid}>
        <div className={styles.sectionCard}>
          <p className={styles.muted}>Carregando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>Configuração do produto (MVP)</h1>
          <p className={styles.subtitle}>1 produto — salvo em localStorage.</p>
        </div>
      </header>

      {toast ? <div className={styles.toast}>{toast}</div> : null}

      <section className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Produto</h2>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Nome
            <input className={styles.input} name='name' defaultValue={product.name} />
          </label>
          <label className={styles.label}>
            Descrição
            <textarea className={styles.textarea} name='description' defaultValue={product.description} />
          </label>
          <label className={styles.label}>
            Preço (R$)
            <input className={styles.input} name='price' defaultValue={(product.priceCents / 100).toFixed(2)} />
          </label>
          <label className={styles.label}>
            Ativo
            <input
              type='checkbox'
              checked={product.active}
              onChange={(event) => setProductState((prev) => (prev ? { ...prev, active: event.target.checked } : prev))}
            />
          </label>

          <div className={styles.actionsRow}>
            <button type='submit' className={styles.primaryButton}>
              Salvar
            </button>
            <p className={styles.muted}>Atual: {formatMoney(product.priceCents)}</p>
          </div>
        </form>
      </section>
    </div>
  )
}
