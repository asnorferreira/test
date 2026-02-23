'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { formatMoney, listOrders, type AdminOrder } from '@/modules/admin/services/admin.store'

function startOfDay(timestamp: number) {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function addDays(timestamp: number, days: number) {
  const d = new Date(timestamp)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function isSale(order: AdminOrder) {
  return order.status === 'pago' || order.status === 'enviado'
}

type BarPoint = { label: string; valueCents: number }

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])

  useEffect(() => {
    setOrders(listOrders())
  }, [])

  const now = Date.now()
  const todayStart = startOfDay(now)
  const todayEnd = addDays(todayStart, 1)

  const todayOrders = useMemo(
    () => orders.filter((o) => o.createdAt >= todayStart && o.createdAt < todayEnd),
    [orders, todayEnd, todayStart]
  )

  const todaySales = useMemo(() => todayOrders.filter(isSale), [todayOrders])
  const todayRevenueCents = useMemo(
    () => todaySales.reduce((sum, o) => sum + o.totalCents, 0),
    [todaySales]
  )

  const pendingCount = useMemo(() => todayOrders.filter((o) => o.status === 'pendente').length, [todayOrders])
  const shippedCount = useMemo(() => todayOrders.filter((o) => o.status === 'enviado').length, [todayOrders])

  const hourlySeries = useMemo((): BarPoint[] => {
    const buckets = Array.from({ length: 8 }, (_, i) => ({ label: `${i * 3}h`, valueCents: 0 }))
    for (const order of todaySales) {
      const hour = new Date(order.createdAt).getHours()
      const bucket = clamp(Math.floor(hour / 3), 0, 7)
      buckets[bucket].valueCents += order.totalCents
    }
    return buckets
  }, [todaySales])

  const dailySeries = useMemo((): BarPoint[] => {
    const days = 7
    const start = addDays(todayStart, -(days - 1))
    const buckets = Array.from({ length: days }, (_, i) => {
      const dayTs = addDays(start, i)
      const label = new Date(dayTs).toLocaleDateString('pt-BR', { weekday: 'short' })
      return { label, valueCents: 0 }
    })
    for (const order of orders) {
      if (!isSale(order)) continue
      if (order.createdAt < start || order.createdAt >= todayEnd) continue
      const dayIndex = clamp(Math.floor((startOfDay(order.createdAt) - start) / (1000 * 60 * 60 * 24)), 0, days - 1)
      buckets[dayIndex].valueCents += order.totalCents
    }
    return buckets
  }, [orders, todayEnd, todayStart])

  return (
    <div className={styles.grid}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>Resumo do dia</h1>
          <p className={styles.subtitle}>Vendas e andamento (mock) a partir dos pedidos.</p>
        </div>
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Receita hoje</span>
          <strong className={styles.statValue}>{formatMoney(todayRevenueCents)}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos hoje</span>
          <strong className={styles.statValue}>{todayOrders.length}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pendentes</span>
          <strong className={styles.statValue}>{pendingCount}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Enviados</span>
          <strong className={styles.statValue}>{shippedCount}</strong>
        </div>
      </section>

      <section className={styles.chartsGrid}>
        <article className={styles.sectionCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.sectionTitle}>Vendas hoje (por horário)</h2>
            <p className={styles.muted}>Somente pedidos pagos/enviados.</p>
          </div>
          <BarChart series={hourlySeries} />
        </article>

        <article className={styles.sectionCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.sectionTitle}>Últimos 7 dias (receita)</h2>
            <p className={styles.muted}>Janela móvel até hoje.</p>
          </div>
          <BarChart series={dailySeries} />
        </article>
      </section>
    </div>
  )
}

function BarChart({ series }: { series: BarPoint[] }) {
  const max = Math.max(1, ...series.map((p) => p.valueCents))
  const height = 160
  const width = 520
  const paddingX = 18
  const barGap = 10
  const barCount = series.length
  const usableWidth = width - paddingX * 2
  const barWidth = (usableWidth - barGap * (barCount - 1)) / barCount

  return (
    <div className={styles.chartWrap}>
      <svg
        viewBox={`0 0 ${width} ${height + 36}`}
        role='img'
        aria-label='Gráfico de barras de receita'
        className={styles.chartSvg}
      >
        <defs>
          <linearGradient id='mmBarBg' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='rgba(201,31,109,0.08)' />
            <stop offset='100%' stopColor='rgba(15,49,43,0.06)' />
          </linearGradient>
        </defs>

        <rect x='0' y='0' width={width} height={height + 36} rx='16' fill='url(#mmBarBg)' />
        <line x1='18' y1={height + 10} x2={width - 18} y2={height + 10} stroke='rgba(15,49,43,0.12)' />

        {series.map((point, index) => {
          const x = paddingX + index * (barWidth + barGap)
          const barHeight = (point.valueCents / max) * height
          const y = height - barHeight + 10
          const labelY = height + 26
          const valueY = y - 6
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx='12'
                fill={point.valueCents > 0 ? 'rgba(201,31,109,0.85)' : 'rgba(15,49,43,0.10)'}
              />
              {point.valueCents > 0 ? (
                <text x={x + barWidth / 2} y={valueY} textAnchor='middle' className={styles.chartValue}>
                  {(point.valueCents / 100).toFixed(0)}
                </text>
              ) : null}
              <text x={x + barWidth / 2} y={labelY} textAnchor='middle' className={styles.chartLabel}>
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>
      <div className={styles.chartLegend}>
        <span className={styles.legendDot} /> Receita (R$) — valores aproximados no topo da barra
      </div>
    </div>
  )
}
