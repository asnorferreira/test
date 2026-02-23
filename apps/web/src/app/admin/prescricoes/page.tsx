'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../admin.module.css'
import {
  formatDateTime,
  listPrescriptions,
  type AdminPrescription,
  type PrescriptionStatus,
} from '@/modules/admin/services/admin.store'

const statusLabels: Record<PrescriptionStatus, string> = {
  pendente: 'Pendente',
  emitida: 'Emitida',
  cancelada: 'Cancelada',
}

function badgeClass(status: PrescriptionStatus) {
  switch (status) {
    case 'pendente':
      return `${styles.badge} ${styles.badgePending}`
    case 'emitida':
      return `${styles.badge} ${styles.badgeOk}`
    case 'cancelada':
      return `${styles.badge} ${styles.badgeBad}`
  }
}

export default function AdminPrescricoesPage() {
  const [items, setItems] = useState<AdminPrescription[]>([])
  const [statusFilter, setStatusFilter] = useState<'todos' | PrescriptionStatus>('todos')

  useEffect(() => {
    setItems(listPrescriptions())
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'todos') return items
    return items.filter((p) => p.status === statusFilter)
  }, [items, statusFilter])

  return (
    <div className={styles.grid}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>Prescrições</h1>
          <p className={styles.subtitle}>Lista de prescrições (mock).</p>
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
              <option value='emitida'>Emitidas</option>
              <option value='cancelada'>Canceladas</option>
            </select>
          </label>
        </div>
      </header>

      <section className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.sectionCard}>
            <p className={styles.muted}>Nenhuma prescrição encontrada.</p>
          </div>
        ) : (
          filtered.map((prescription) => (
            <article key={prescription.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <div>
                  <p className={styles.itemTitle}>
                    #{prescription.id}{' '}
                    <span className={badgeClass(prescription.status)}>{statusLabels[prescription.status]}</span>
                  </p>
                  <div className={styles.itemMeta}>
                    <span>{prescription.patientName}</span>
                    <span>•</span>
                    <span>Caso: {prescription.caseId}</span>
                    <span>•</span>
                    <span>{formatDateTime(prescription.createdAt)}</span>
                  </div>
                </div>
              </div>
              {prescription.notes ? <p className={styles.muted}>Observações: {prescription.notes}</p> : null}
            </article>
          ))
        )}
      </section>
    </div>
  )
}
