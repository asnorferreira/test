'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import styles from '../painel.module.css'
import { listCases, type CaseStatus, type DoctorCase } from '@/modules/doctor/services/cases.store'

const statusLabels: Record<CaseStatus, string> = {
  pendente: 'Pendente',
  em_pre_analise: 'Pré-análise',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
}

function badgeClass(status: CaseStatus) {
  switch (status) {
    case 'pendente':
      return `${styles.badge} ${styles.badgePending}`
    case 'em_pre_analise':
      return `${styles.badge} ${styles.badgePre}`
    case 'aprovado':
      return `${styles.badge} ${styles.badgeApproved}`
    case 'recusado':
      return `${styles.badge} ${styles.badgeDenied}`
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function CasosMedicoPage() {
  const [cases, setCases] = useState<DoctorCase[]>([])
  const [statusFilter, setStatusFilter] = useState<'todos' | CaseStatus>('todos')

  useEffect(() => {
    setCases(listCases())
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'todos') return cases
    return cases.filter((item) => item.status === statusFilter)
  }, [cases, statusFilter])

  const stats = useMemo(() => {
    const byStatus = { pendente: 0, em_pre_analise: 0, aprovado: 0, recusado: 0 } satisfies Record<
      CaseStatus,
      number
    >
    for (const item of cases) byStatus[item.status] += 1
    return byStatus
  }, [cases])

  return (
    <div className={styles.grid}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Painel médico</p>
          <h1 className={styles.title}>Fila de casos</h1>
          <p className={styles.subtitle}>Acompanhe pendências, alertas e decisões do dia.</p>
        </div>

        <div className={styles.toolbar}>
          <label>
            <span className={styles.muted}>Status</span>
            <div>
              <select
                className={styles.select}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as any)}
              >
                <option value='todos'>Todos</option>
                <option value='pendente'>Pendentes</option>
                <option value='em_pre_analise'>Pré-análise</option>
                <option value='aprovado'>Aprovados</option>
                <option value='recusado'>Recusados</option>
              </select>
            </div>
          </label>
        </div>
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pendentes</span>
          <strong className={styles.statValue}>{stats.pendente}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pré-análise</span>
          <strong className={styles.statValue}>{stats.em_pre_analise}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Aprovados</span>
          <strong className={styles.statValue}>{stats.aprovado}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Recusados</span>
          <strong className={styles.statValue}>{stats.recusado}</strong>
        </div>
      </section>

      <section className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.sectionCard}>
            <p className={styles.muted}>Nenhum caso encontrado para o filtro selecionado.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className={styles.caseCard}>
              <div className={styles.caseTop}>
                <div>
                  <p className={styles.caseTitle}>
                    {item.patient.name} <span className={badgeClass(item.status)}>{statusLabels[item.status]}</span>
                  </p>
                  <div className={styles.caseMeta}>
                    <span>#{item.id}</span>
                    <span>•</span>
                    <span>Enviado: {formatDate(item.createdAt)}</span>
                    <span>•</span>
                    <span>Alertas: {item.preAnalysisAlerts.length}</span>
                  </div>
                </div>
                <div className={styles.caseActions}>
                  <Link href={`/painel-medico/caso/${item.id}`} className={styles.primaryLink}>
                    Ver detalhes
                  </Link>
                </div>
              </div>
              {item.preAnalysisAlerts.length ? (
                <p className={styles.muted}>Pré-análise: {item.preAnalysisAlerts[0]}</p>
              ) : (
                <p className={styles.muted}>Sem alertas automáticos.</p>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  )
}

