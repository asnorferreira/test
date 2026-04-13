'use client'

import { ReactNode } from 'react'

type Variant = 'info' | 'success' | 'warning' | 'error'

const COLORS: Record<Variant, { bg: string; border: string; color: string }> = {
  info: { bg: '#eef4ff', border: '#c7d8ff', color: '#1f3a80' },
  success: { bg: '#ecfbf2', border: '#a5e3c1', color: '#157347' },
  warning: { bg: '#fff7e6', border: '#ffd68a', color: '#8a5a00' },
  error: { bg: '#fdecea', border: '#f6b4ad', color: '#b42318' },
}

export function Alert({ variant = 'info', children }: { variant?: Variant; children: ReactNode }) {
  const c = COLORS[variant]
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 12,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: 14,
        lineHeight: 1.45,
      }}
    >
      {children}
    </div>
  )
}
