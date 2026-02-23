'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../admin.module.css'
import { formatDateTime, formatMoney, listOrders, type AdminOrder, type OrderStatus } from '@/modules/admin/services/admin.store'

const statusLabels: Record<OrderStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
}

function badgeClass(status: OrderStatus) {
  switch (status) {
    case 'pendente':
      return `${styles.badge} ${styles.badgePending}`
    case 'pago':
      return `${styles.badge} ${styles.badgeOk}`
    case 'enviado':
      return `${styles.badge} ${styles.badgeWarn}`
    case 'cancelado':
      return `${styles.badge} ${styles.badgeBad}`
  }
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos')

  useEffect(() => {
    setOrders(listOrders())
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'todos') return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  return (
    <div className={styles.grid}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>Pedidos</h1>
          <p className={styles.subtitle}>Lista de pedidos do MVP (mock).</p>
        </div>
        <div>
          <label className={styles.label}>
            Filtrar por status
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as any)}
            >
              <option value='todos'>Todos</option>
              <option value='pendente'>Pendentes</option>
              <option value='pago'>Pagos</option>
              <option value='enviado'>Enviados</option>
              <option value='cancelado'>Cancelados</option>
            </select>
          </label>
        </div>
      </header>

      <section className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.sectionCard}>
            <p className={styles.muted}>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          filtered.map((order) => (
            <article key={order.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <div>
                  <p className={styles.itemTitle}>
                    #{order.id} <span className={badgeClass(order.status)}>{statusLabels[order.status]}</span>
                  </p>
                  <div className={styles.itemMeta}>
                    <span>{order.customerName}</span>
                    <span>•</span>
                    <span>{formatDateTime(order.createdAt)}</span>
                    <span>•</span>
                    <span>Total: {formatMoney(order.totalCents)}</span>
                  </div>
                </div>
              </div>
              <p className={styles.muted}>
                Itens: {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
