'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import styles from '../../painel.module.css'
import { getCaseById, setCaseStatus, type CaseStatus, type DoctorCase } from '@/modules/doctor/services/cases.store'

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

export default function DetalheCasoPage() {
  const params = useParams<{ id: string }>()
  const caseId = useMemo(() => decodeURIComponent(params.id), [params.id])

  const [caseItem, setCaseItem] = useState<DoctorCase | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setCaseItem(getCaseById(caseId))
  }, [caseId])

  if (!caseItem) {
    return (
      <div className={styles.grid}>
        <div className={styles.sectionCard}>
          <div className={styles.detailHeaderRow}>
            <Link href='/painel-medico/casos' className={styles.backLink}>
              ← Voltar
            </Link>
          </div>
          <p className={styles.muted}>Caso não encontrado.</p>
        </div>
      </div>
    )
  }

  const resolved = caseItem.status === 'aprovado' || caseItem.status === 'recusado'

  const handleDecision = (status: Extract<CaseStatus, 'aprovado' | 'recusado'>) => {
    setCaseStatus(caseItem.id, status)
    const refreshed = getCaseById(caseItem.id)
    setCaseItem(refreshed)
    setToast('Status atualizado e notificação enviada ao paciente.')
  }

  return (
    <div className={styles.grid}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.kicker}>Detalhe do caso</p>
          <h1 className={styles.title}>
            {caseItem.patient.name}{' '}
            <span className={badgeClass(caseItem.status)}>{statusLabels[caseItem.status]}</span>
          </h1>
          <p className={styles.subtitle}>#{caseItem.id}</p>
        </div>

        <div className={styles.toolbar}>
          <Link href='/painel-medico/casos' className={styles.backLink}>
            ← Voltar para fila
          </Link>
        </div>
      </header>

      {toast ? <div className={styles.toast}>{toast}</div> : null}

      <section className={styles.sectionCard}>
        <div className={styles.detailHeaderRow}>
          <h2 className={styles.sectionTitle}>Ações</h2>
          <div className={styles.buttonRow}>
            <button
              type='button'
              className={`${styles.button} ${styles.approveButton} ${resolved ? styles.disabledButton : ''}`}
              disabled={resolved}
              onClick={() => handleDecision('aprovado')}
            >
              Aprovar
            </button>
            <button
              type='button'
              className={`${styles.button} ${styles.denyButton} ${resolved ? styles.disabledButton : ''}`}
              disabled={resolved}
              onClick={() => handleDecision('recusado')}
            >
              Recusar
            </button>
          </div>
        </div>
        <p className={styles.muted}>
          Ao aprovar ou recusar, o status do caso é atualizado e uma notificação (mock) é registrada para o paciente.
        </p>
      </section>

      <section className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Alertas da pré-análise</h2>
        {caseItem.preAnalysisAlerts.length ? (
          <ul className={styles.listClean}>
            {caseItem.preAnalysisAlerts.map((alert) => (
              <li key={alert} className={styles.alertItem}>
                <span>{alert}</span>
                <span>!</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Sem alertas automáticos para este caso.</p>
        )}
      </section>

      <section className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Respostas do questionário</h2>
        <ul className={styles.listClean}>
          {caseItem.questionnaire.map((item) => (
            <li key={item.question} className={styles.qaItem}>
              <p className={styles.qaQuestion}>{item.question}</p>
              <p className={styles.qaAnswer}>{item.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

